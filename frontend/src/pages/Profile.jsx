import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { USING_BACKEND, api } from "../lib/api.js";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (form.next !== form.confirm) return setMsg({ ok: false, text: "New passwords don't match" });
    if (form.next.length < 6) return setMsg({ ok: false, text: "New password must be at least 6 characters" });
    setBusy(true);
    try {
      await api.changePassword(form.current, form.next);
      setMsg({ ok: true, text: "Password changed ✓" });
      setForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="content" style={{ maxWidth: 640 }}>
      <h1>Profile</h1>
      <div className="card mt-2">
        <div className="row" style={{ gap: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,var(--brand),var(--brand-2))", display: "grid", placeItems: "center", fontSize: 26, fontWeight: 800 }}>
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{user.name}</h3>
            <span className="muted">{user.email}</span>
          </div>
          {user.role === "admin" && <span className="pill pill-medium">admin</span>}
        </div>
        <table className="tbl mt-3">
          <tbody>
            <tr><td className="muted">Name</td><td>{user.name}</td></tr>
            <tr><td className="muted">Email</td><td>{user.email}</td></tr>
            <tr><td className="muted">Role</td><td>{user.role}</td></tr>
            <tr><td className="muted">Storage</td><td>{USING_BACKEND ? "TiDB (cloud account)" : "Browser (demo mode)"}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card mt-3">
        <h3 style={{ marginTop: 0 }}>🔒 Change password</h3>
        <form onSubmit={submit}>
          <div className="field">
            <label>Current password</label>
            <input className="input" type="password" value={form.current}
              onChange={(e) => setForm({ ...form, current: e.target.value })} required />
          </div>
          <div className="field">
            <label>New password</label>
            <input className="input" type="password" value={form.next}
              onChange={(e) => setForm({ ...form, next: e.target.value })} minLength={6} required />
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input className="input" type="password" value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          </div>
          {msg && (
            <div className={`callout ${msg.ok ? "tip" : "warn"}`} style={{ margin: "0 0 14px" }}>{msg.text}</div>
          )}
          <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Update password"}</button>
        </form>
      </div>
    </div>
  );
}
