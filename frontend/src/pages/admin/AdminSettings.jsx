import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

export default function AdminSettings() {
  const [settings, setSettings] = useState({ site_name: "DataFlow Academy", allow_signups: "true", show_leaderboard: "true" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => setSettings((cur) => ({ ...cur, ...s }))).catch(() => {});
  }, []);

  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setBusy(true); setMsg("");
    try { await api.saveSettings(settings); setMsg("Saved ✓"); setTimeout(() => setMsg(""), 2000); }
    catch (e) { setMsg("Error: " + e.message); }
    finally { setBusy(false); }
  };

  const toggle = (k, label) => (
    <label className="row between" style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <span>{label}</span>
      <input type="checkbox" checked={settings[k] === "true"} onChange={(e) => set(k, e.target.checked ? "true" : "false")} style={{ width: 18, height: 18 }} />
    </label>
  );

  return (
    <div className="content" style={{ maxWidth: 640 }}>
      <h1>⚙️ Platform settings</h1>
      <p>Configure the platform.</p>

      <div className="card mt-2">
        <div className="field">
          <label>Site name</label>
          <input className="input" value={settings.site_name} onChange={(e) => set("site_name", e.target.value)} />
        </div>
        <h3 style={{ marginBottom: 4 }}>Feature toggles</h3>
        {toggle("allow_signups", "Allow new sign-ups")}
        {toggle("show_leaderboard", "Show leaderboard")}
        <div className="row mt-3">
          <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>
          {msg && <span className="muted" style={{ fontSize: 13 }}>{msg}</span>}
        </div>
      </div>
    </div>
  );
}
