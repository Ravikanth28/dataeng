import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setProjects(await api.getProjects());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    await api.deleteProject(id);
    load();
  };

  return (
    <div className="content">
      <div className="row between wrap">
        <div>
          <h1>My projects</h1>
          <p>Projects you've built and saved.</p>
        </div>
        <Link to="/app/workspace" className="btn btn-primary">+ New project</Link>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="card center mt-2">
          <div style={{ fontSize: 40 }}>🧩</div>
          <h3>No projects yet</h3>
          <p>Build your first pipeline in the Project Builder.</p>
          <Link to="/app/workspace" className="btn btn-primary">Open Project Builder</Link>
        </div>
      ) : (
        <div className="grid grid-2 mt-2">
          {projects.map((p) => (
            <div key={p.id} className="card">
              <div className="row between">
                <h3 style={{ margin: 0 }}>🧩 {p.title}</h3>
                <span className="pill">{p.type}</span>
              </div>
              <p className="muted mt-1" style={{ fontSize: 12 }}>
                Updated {new Date(p.updated_at).toLocaleString()}
              </p>
              <div className="row mt-2">
                <Link to={`/app/workspace/${p.id}`} className="btn btn-primary">Open →</Link>
                <button className="btn btn-ghost" onClick={() => remove(p.id)}>🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
