import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminUsers().then((u) => { setUsers(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="content">
      <h1>Users</h1>
      <p>{users.length} registered {users.length === 1 ? "user" : "users"}.</p>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="card mt-2" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td className="muted">{u.email}</td>
                  <td>
                    <span className={`pill ${u.role === "admin" ? "pill-medium" : ""}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`pill ${u.is_active ? "pill-easy" : "pill-advanced"}`}>
                      {u.is_active ? "active" : "disabled"}
                    </span>
                  </td>
                  <td className="muted">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
