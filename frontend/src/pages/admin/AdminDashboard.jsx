import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.adminStats().then(setStats).catch(() => setStats({}));
  }, []);

  const cards = [
    { label: "Total users", value: stats?.total_users, icon: "👥" },
    { label: "Active users", value: stats?.active_users, icon: "✅" },
    { label: "Projects built", value: stats?.total_projects, icon: "🧩" },
    { label: "Lessons completed", value: stats?.lessons_completed, icon: "📚" },
  ];

  return (
    <div className="content">
      <h1>Admin dashboard</h1>
      <p>Platform overview.</p>

      <div className="grid grid-2 mt-2">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="muted" style={{ fontSize: 13 }}>{c.icon} {c.label}</div>
            <div style={{ fontSize: 34, fontWeight: 800 }}>{stats ? (c.value ?? 0) : "…"}</div>
          </div>
        ))}
      </div>

      <div className="card mt-3 row between wrap">
        <div>
          <h3 style={{ margin: 0 }}>Manage users</h3>
          <span className="muted">View, activate, or promote users.</span>
        </div>
        <Link to="/app/admin/users" className="btn btn-primary">Open users →</Link>
      </div>
    </div>
  );
}
