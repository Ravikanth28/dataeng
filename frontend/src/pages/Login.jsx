import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { USING_BACKEND } from "../lib/api.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card card">
        <Link to="/" className="logo" style={{ marginBottom: 20 }}>
          <span className="dot">◆</span> DataFlow Academy
        </Link>
        <h2>Welcome back</h2>
        <p>Log in to continue learning.</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="callout warn" style={{ margin: "0 0 14px" }}>{error}</div>}
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="mt-2" style={{ marginBottom: 0 }}>
          No account? <Link to="/signup" style={{ color: "var(--brand)" }}>Sign up free</Link>
        </p>
        {!USING_BACKEND && (
          <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            Demo mode: accounts are stored locally in your browser.
          </p>
        )}
      </div>
    </div>
  );
}
