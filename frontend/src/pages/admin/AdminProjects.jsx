import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminAllProjects().then((p) => { setProjects(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="content">
      <h1>🧩 Project review</h1>
      <p>Projects built by students across the platform.</p>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : projects.length === 0 ? (
        <p className="muted">No projects submitted yet.</p>
      ) : (
        <div className="card mt-2" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Student</th><th>Project</th><th>Type</th><th>Updated</th></tr></thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>{p.user_name}<div className="muted" style={{ fontSize: 12 }}>{p.user_email}</div></td>
                  <td>{p.title}</td>
                  <td><span className="pill">{p.type}</span></td>
                  <td className="muted">{p.updated_at ? new Date(p.updated_at).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
