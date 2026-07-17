import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

export default function AdminAnnouncements() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", body: "" });
  const [busy, setBusy] = useState(false);

  const load = async () => setItems(await api.getAnnouncements());
  useEffect(() => { load(); }, []);

  const post = async () => {
    if (!form.title) return;
    setBusy(true);
    try {
      await api.createAnnouncement(form);
      setForm({ title: "", body: "" });
      await load();
    } finally { setBusy(false); }
  };
  const remove = async (id) => { await api.deleteAnnouncement(id); load(); };

  return (
    <div className="content" style={{ maxWidth: 760 }}>
      <h1>📣 Announcements</h1>
      <p>Post notices shown on every student's dashboard.</p>

      <div className="card mt-2">
        <div className="field">
          <label>Title</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="New Kafka track live!" />
        </div>
        <div className="field">
          <label>Message</label>
          <textarea className="input" style={{ minHeight: 80 }} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </div>
        <button className="btn btn-primary" onClick={post} disabled={busy || !form.title}>{busy ? "Posting…" : "Post announcement"}</button>
      </div>

      <h2 className="mt-4">Posted ({items.length})</h2>
      {items.length === 0 ? (
        <p className="muted">Nothing posted yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="mt-2">
          {items.map((a) => (
            <div key={a.id} className="card">
              <div className="row between">
                <strong>{a.title}</strong>
                <button className="btn btn-ghost" onClick={() => remove(a.id)}>🗑</button>
              </div>
              <p style={{ margin: "6px 0 0" }}>{a.body}</p>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{a.created_at ? new Date(a.created_at).toLocaleString() : ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
