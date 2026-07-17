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

      <h2 className="mt-4">Manage</h2>
      <div className="grid grid-3 mt-2">
        {[
          { to: "/app/admin/users", icon: "👥", label: "Users", desc: "View, activate, promote" },
          { to: "/app/admin/content", icon: "📝", label: "Content manager", desc: "Create & edit lessons" },
          { to: "/app/admin/projects", icon: "🧩", label: "Project review", desc: "Browse student projects" },
          { to: "/app/admin/analytics", icon: "📈", label: "Analytics", desc: "Completions & engagement" },
          { to: "/app/admin/announcements", icon: "📣", label: "Announcements", desc: "Post notices" },
          { to: "/app/admin/settings", icon: "⚙️", label: "Settings", desc: "Site config & toggles" },
        ].map((c) => (
          <Link key={c.to} to={c.to} className="card card-hover">
            <div style={{ fontSize: 26 }}>{c.icon}</div>
            <h3 style={{ margin: "6px 0 2px" }}>{c.label}</h3>
            <span className="muted" style={{ fontSize: 13 }}>{c.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
