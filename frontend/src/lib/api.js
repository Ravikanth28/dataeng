// Thin API layer. If VITE_API_URL is set it talks to the FastAPI backend.
// Otherwise it falls back to localStorage so the app is fully usable offline.

const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
export const USING_BACKEND = !!BASE;

const TOKEN_KEY = "dfa_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

async function req(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

/* ---------------- localStorage fallback helpers ---------------- */
const lsGet = (k, d) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d));
const lsSet = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function localSignup({ name, email, password }) {
  const users = lsGet("dfa_users", []);
  if (users.find((u) => u.email === email)) throw new Error("Email already registered");
  const user = {
    id: Date.now(),
    name,
    email,
    password,
    role: email.includes("admin") ? "admin" : "student",
    is_active: true,
    created_at: new Date().toISOString(),
  };
  users.push(user);
  lsSet("dfa_users", users);
  return fakeToken(user);
}

function localLogin({ email, password }) {
  const users = lsGet("dfa_users", []);
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error("Invalid email or password");
  return fakeToken(user);
}

function fakeToken(user) {
  const { password, ...safe } = user;
  setToken(`local.${user.id}`);
  lsSet("dfa_current", safe);
  return { access_token: `local.${user.id}`, user: safe };
}

/* ---------------- Public API ---------------- */
export const api = {
  async signup(data) {
    if (USING_BACKEND) {
      const r = await req("/auth/signup", { method: "POST", body: data, auth: false });
      setToken(r.access_token);
      return r;
    }
    return localSignup(data);
  },

  async login(data) {
    if (USING_BACKEND) {
      const r = await req("/auth/login", { method: "POST", body: data, auth: false });
      setToken(r.access_token);
      return r;
    }
    return localLogin(data);
  },

  async me() {
    if (USING_BACKEND) return req("/auth/me");
    return lsGet("dfa_current", null);
  },

  logout() {
    setToken(null);
    localStorage.removeItem("dfa_current");
  },

  async changePassword(current_password, new_password) {
    if (USING_BACKEND)
      return req("/auth/change-password", { method: "POST", body: { current_password, new_password } });
    // localStorage demo: update the stored user's password
    const cur = lsGet("dfa_current", null);
    const users = lsGet("dfa_users", []);
    const u = users.find((x) => x.id === cur?.id);
    if (!u || u.password !== current_password) throw new Error("Current password is incorrect");
    u.password = new_password;
    lsSet("dfa_users", users);
    return { ok: true };
  },

  async getRuns(projectId) {
    if (USING_BACKEND) return req(`/runs${projectId ? `?project_id=${projectId}` : ""}`);
    return lsGet("dfa_runs", []).filter((r) => !projectId || r.project_id === projectId).slice(0, 20);
  },
  async createRun(data) {
    if (USING_BACKEND) return req("/runs", { method: "POST", body: data });
    const all = lsGet("dfa_runs", []);
    const r = { id: Date.now(), ...data, created_at: new Date().toISOString() };
    all.unshift(r);
    lsSet("dfa_runs", all.slice(0, 20));
    return r;
  },

  /* ----- progress ----- */
  async getProgress() {
    if (USING_BACKEND) return req("/progress");
    return lsGet("dfa_progress", []);
  },
  async saveProgress(lesson_id, status = "completed", score = 0) {
    if (USING_BACKEND)
      return req("/progress", { method: "POST", body: { lesson_id, status, score } });
    const all = lsGet("dfa_progress", []).filter((p) => p.lesson_id !== lesson_id);
    all.push({ lesson_id, status, score });
    lsSet("dfa_progress", all);
    return { lesson_id, status, score };
  },

  /* ----- projects ----- */
  async getProjects() {
    if (USING_BACKEND) return req("/projects");
    return lsGet("dfa_projects", []);
  },
  async createProject(data) {
    if (USING_BACKEND) return req("/projects", { method: "POST", body: data });
    const all = lsGet("dfa_projects", []);
    const p = { id: Date.now(), ...data, updated_at: new Date().toISOString() };
    all.push(p);
    lsSet("dfa_projects", all);
    return p;
  },
  async updateProject(id, data) {
    if (USING_BACKEND) return req(`/projects/${id}`, { method: "PUT", body: data });
    const all = lsGet("dfa_projects", []).map((p) =>
      p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p
    );
    lsSet("dfa_projects", all);
    return all.find((p) => p.id === id);
  },
  async deleteProject(id) {
    if (USING_BACKEND) return req(`/projects/${id}`, { method: "DELETE" });
    lsSet("dfa_projects", lsGet("dfa_projects", []).filter((p) => p.id !== id));
    return { ok: true };
  },

  /* ----- admin ----- */
  async adminStats() {
    if (USING_BACKEND) return req("/admin/stats");
    return {
      total_users: lsGet("dfa_users", []).length,
      active_users: lsGet("dfa_users", []).filter((u) => u.is_active).length,
      total_projects: lsGet("dfa_projects", []).length,
      lessons_completed: lsGet("dfa_progress", []).length,
    };
  },
  async adminUsers() {
    if (USING_BACKEND) return req("/admin/users");
    return lsGet("dfa_users", []).map(({ password, ...u }) => u);
  },

  /* ----- CMS lessons ----- */
  async getCustomLessons() {
    if (USING_BACKEND) return req("/lessons", { auth: false });
    return lsGet("dfa_lessons", []);
  },
  async adminCreateLesson(data) {
    if (USING_BACKEND) return req("/admin/lessons", { method: "POST", body: data });
    const all = lsGet("dfa_lessons", []);
    const l = { id: Date.now(), ...data };
    all.push(l);
    lsSet("dfa_lessons", all);
    return l;
  },
  async adminUpdateLesson(id, data) {
    if (USING_BACKEND) return req(`/admin/lessons/${id}`, { method: "PUT", body: data });
    const all = lsGet("dfa_lessons", []).map((l) => (l.id === id ? { ...l, ...data } : l));
    lsSet("dfa_lessons", all);
    return all.find((l) => l.id === id);
  },
  async adminDeleteLesson(id) {
    if (USING_BACKEND) return req(`/admin/lessons/${id}`, { method: "DELETE" });
    lsSet("dfa_lessons", lsGet("dfa_lessons", []).filter((l) => l.id !== id));
    return { ok: true };
  },
};
