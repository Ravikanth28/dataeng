import { Link } from "react-router-dom";
import { CAPSTONES } from "../data/capstones.js";

const diffClass = { beginner: "pill-easy", intermediate: "pill-medium", advanced: "pill-advanced" };

export default function Capstones() {
  return (
    <div className="content">
      <h1>🏆 Capstone projects</h1>
      <p>Pick a project and build it in the Project Builder — write real code in each stage and run the whole pipeline.</p>

      <div className="grid grid-2 mt-2">
        {CAPSTONES.map((c) => (
          <div key={c.id} className="card">
            <div className="row between">
              <div className="row" style={{ gap: 12 }}>
                <div style={{ fontSize: 30 }}>{c.icon}</div>
                <h3 style={{ margin: 0 }}>{c.title}</h3>
              </div>
              <span className={`pill ${diffClass[c.difficulty]}`}>{c.difficulty}</span>
            </div>
            <p className="mt-2">{c.description}</p>
            <div className="row wrap" style={{ gap: 6, marginBottom: 14 }}>
              {c.stages.map((s) => (
                <span key={s.key} className="pill" style={{ color: s.color, padding: "3px 9px" }}>
                  {s.icon} {s.label}
                </span>
              ))}
              <span className="pill" style={{ color: "#6c8cff", padding: "3px 9px" }}>🗓️ Airflow</span>
            </div>
            <Link to={`/app/workspace?template=${c.id}`} className="btn btn-primary">Build this →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
