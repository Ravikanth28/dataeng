import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCourse } from "../context/CourseContext.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const { tracks } = useCourse();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const doLogout = () => {
    logout();
    navigate("/");
  };
  const close = () => setOpen(false);

  return (
    <div className="app-shell">
      <div className={`backdrop ${open ? "show" : ""}`} onClick={close} />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <NavLink to="/app/dashboard" className="logo" style={{ marginBottom: 10 }} onClick={close}>
          <span className="dot">◆</span> DataFlow
        </NavLink>

        <div className="nav-group-label">Learn</div>
        <NavLink to="/app/dashboard" className="nav-item" onClick={close}>🏠 Dashboard</NavLink>
        <NavLink to="/app/catalog" className="nav-item" onClick={close}>📚 All tracks</NavLink>

        <div className="nav-group-label">Tracks</div>
        {tracks.map((t) => (
          <NavLink key={t.id} to={`/app/track/${t.id}`} className="nav-item" onClick={close}>
            <span>{t.icon}</span> {t.title.replace("Apache ", "")}
          </NavLink>
        ))}

        <div className="nav-group-label">Build</div>
        <NavLink to="/app/capstones" className="nav-item" onClick={close}>🏆 Capstone projects</NavLink>
        <NavLink to="/app/workspace" className="nav-item" onClick={close}>🧩 Project Builder</NavLink>
        <NavLink to="/app/projects" className="nav-item" onClick={close}>💾 My projects</NavLink>

        {user?.role === "admin" && (
          <>
            <div className="nav-group-label">Admin</div>
            <NavLink to="/app/admin" className="nav-item" onClick={close}>📊 Admin dashboard</NavLink>
            <NavLink to="/app/admin/users" className="nav-item" onClick={close}>👥 Users</NavLink>
            <NavLink to="/app/admin/content" className="nav-item" onClick={close}>📝 Content manager</NavLink>
            <NavLink to="/app/admin/projects" className="nav-item" onClick={close}>🧩 Project review</NavLink>
            <NavLink to="/app/admin/analytics" className="nav-item" onClick={close}>📈 Analytics</NavLink>
            <NavLink to="/app/admin/announcements" className="nav-item" onClick={close}>📣 Announcements</NavLink>
            <NavLink to="/app/admin/settings" className="nav-item" onClick={close}>⚙️ Settings</NavLink>
          </>
        )}
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-ghost hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
              ☰
            </button>
            <span className="muted" style={{ fontSize: 13 }}>Learn Airflow · Spark · Kafka</span>
          </div>
          <div className="row">
            <NavLink to="/app/profile" className="pill" onClick={close}>
              👤 {user?.name || "You"}
              {user?.role === "admin" && <span style={{ color: "var(--amber)" }}> · admin</span>}
            </NavLink>
            <button className="btn btn-ghost" onClick={doLogout}>Log out</button>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
