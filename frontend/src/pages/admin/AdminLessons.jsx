import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { useCourse } from "../../context/CourseContext.jsx";

const EMPTY = {
  track_id: "foundations",
  title: "",
  level: "easy",
  minutes: 8,
  order: 100,
  body: "<h2>New lesson</h2>\n<p>Write lesson content here. HTML is supported.</p>",
  p_type: "none",
  p_title: "",
  p_instructions: "",
  p_starter: "",
};

export default function AdminLessons() {
  const { tracks, reload } = useCourse();
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => setLessons(await api.getCustomLessons());
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const startEdit = (l) => {
    let p = { p_type: "none", p_title: "", p_instructions: "", p_starter: "" };
    if (l.practice_json) {
      try {
        const pj = JSON.parse(l.practice_json);
        p = { p_type: pj.type || "none", p_title: pj.title || "", p_instructions: pj.instructions || "", p_starter: pj.starter || "" };
      } catch {}
    }
    setForm({ track_id: l.track_id, title: l.title, level: l.level, minutes: l.minutes, order: l.order, body: l.body, ...p });
    setEditingId(l.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => { setForm(EMPTY); setEditingId(null); };

  const save = async () => {
    setBusy(true);
    setMsg("");
    const practice_json =
      form.p_type === "none"
        ? ""
        : JSON.stringify({ type: form.p_type, title: form.p_title, instructions: form.p_instructions, starter: form.p_starter });
    const payload = {
      track_id: form.track_id, title: form.title, level: form.level,
      minutes: Number(form.minutes) || 8, order: Number(form.order) || 100,
      body: form.body, practice_json,
    };
    try {
      if (editingId) await api.adminUpdateLesson(editingId, payload);
      else await api.adminCreateLesson(payload);
      setMsg("Saved ✓");
      reset();
      await load();
      await reload(); // refresh the live course so it appears immediately
    } catch (e) {
      setMsg("Error: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    await api.adminDeleteLesson(id);
    await load();
    await reload();
  };

  return (
    <div className="content">
      <h1>📝 Content manager</h1>
      <p>Create and edit lessons — they appear in the course instantly, stored in your database.</p>

      {/* Editor */}
      <div className="card mt-2">
        <h3 style={{ marginTop: 0 }}>{editingId ? "Edit lesson" : "New lesson"}</h3>
        <div className="grid grid-2">
          <div className="field">
            <label>Track</label>
            <select className="input" value={form.track_id} onChange={(e) => set("track_id", e.target.value)}>
              {tracks.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.title}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Title</label>
            <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Lesson title" />
          </div>
        </div>
        <div className="grid grid-3">
          <div className="field">
            <label>Level</label>
            <select className="input" value={form.level} onChange={(e) => set("level", e.target.value)}>
              <option value="easy">easy</option><option value="medium">medium</option><option value="advanced">advanced</option>
            </select>
          </div>
          <div className="field">
            <label>Minutes</label>
            <input className="input" type="number" value={form.minutes} onChange={(e) => set("minutes", e.target.value)} />
          </div>
          <div className="field">
            <label>Order</label>
            <input className="input" type="number" value={form.order} onChange={(e) => set("order", e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Body (HTML)</label>
          <textarea className="input" style={{ minHeight: 160, fontFamily: "var(--mono)", fontSize: 13 }}
            value={form.body} onChange={(e) => set("body", e.target.value)} />
        </div>

        <div className="field">
          <label>Practice (optional)</label>
          <select className="input" value={form.p_type} onChange={(e) => set("p_type", e.target.value)}>
            <option value="none">None</option>
            <option value="python">Python (real)</option>
            <option value="sql">SQL (real)</option>
            <option value="dag">Airflow DAG simulator</option>
            <option value="kafka">Kafka simulator</option>
          </select>
        </div>
        {form.p_type !== "none" && (
          <>
            <div className="field">
              <label>Practice title</label>
              <input className="input" value={form.p_title} onChange={(e) => set("p_title", e.target.value)} />
            </div>
            <div className="field">
              <label>Practice instructions</label>
              <input className="input" value={form.p_instructions} onChange={(e) => set("p_instructions", e.target.value)} />
            </div>
            <div className="field">
              <label>Starter code</label>
              <textarea className="input" style={{ minHeight: 120, fontFamily: "var(--mono)", fontSize: 13 }}
                value={form.p_starter} onChange={(e) => set("p_starter", e.target.value)} />
            </div>
          </>
        )}

        <div className="row">
          <button className="btn btn-primary" onClick={save} disabled={busy || !form.title}>
            {busy ? "Saving…" : editingId ? "Update lesson" : "Create lesson"}
          </button>
          {editingId && <button className="btn btn-ghost" onClick={reset}>Cancel</button>}
          {msg && <span className="muted" style={{ fontSize: 13 }}>{msg}</span>}
        </div>
      </div>

      {/* List */}
      <h2 className="mt-4">Custom lessons ({lessons.length})</h2>
      {lessons.length === 0 ? (
        <p className="muted">No custom lessons yet. Create one above.</p>
      ) : (
        <div className="card mt-2" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Track</th><th>Title</th><th>Level</th><th></th></tr></thead>
            <tbody>
              {lessons.map((l) => (
                <tr key={l.id}>
                  <td className="muted">{l.track_id}</td>
                  <td>{l.title}</td>
                  <td><span className={`pill pill-${l.level}`}>{l.level}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" onClick={() => startEdit(l)}>✏️ Edit</button>
                    <button className="btn btn-ghost" onClick={() => remove(l.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
