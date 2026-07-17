import { useAuth } from "../context/AuthContext.jsx";
import { USING_BACKEND } from "../lib/api.js";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="content" style={{ maxWidth: 640 }}>
      <h1>Profile</h1>
      <div className="card mt-2">
        <div className="row" style={{ gap: 16 }}>
          <div
            style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "linear-gradient(135deg,var(--brand),var(--brand-2))",
              display: "grid", placeItems: "center", fontSize: 26, fontWeight: 800,
            }}
          >
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
    </div>
  );
}
