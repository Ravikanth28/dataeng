import { useState } from "react";
import CodeEditor from "./CodeEditor.jsx";

// Extract a python-ish array literal (tasks / edges) and parse it as JSON.
function parseArray(code, name) {
  const re = new RegExp(`${name}\\s*=\\s*(\\[[\\s\\S]*?\\])`, "m");
  const m = code.match(re);
  if (!m) return null;
  let json = m[1]
    .replace(/'/g, '"')
    .replace(/#[^\n]*/g, "")
    .replace(/,(\s*[\]}])/g, "$1");
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Kahn's algorithm → run order in levels (parallel tasks share a level).
function topoLevels(tasks, edges) {
  const indeg = Object.fromEntries(tasks.map((t) => [t, 0]));
  const adj = Object.fromEntries(tasks.map((t) => [t, []]));
  for (const [a, b] of edges) {
    if (!(a in adj) || !(b in indeg)) continue;
    adj[a].push(b);
    indeg[b]++;
  }
  const levels = [];
  let frontier = tasks.filter((t) => indeg[t] === 0);
  const seen = new Set();
  while (frontier.length) {
    levels.push(frontier);
    frontier.forEach((t) => seen.add(t));
    const next = [];
    for (const t of frontier)
      for (const nb of adj[t]) {
        indeg[nb]--;
        if (indeg[nb] === 0 && !seen.has(nb)) next.push(nb);
      }
    frontier = [...new Set(next)];
  }
  return levels;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function DagSimulator({ starter, onComplete }) {
  const [code, setCode] = useState(starter);
  const [levels, setLevels] = useState([]);
  const [state, setState] = useState({}); // taskId -> pending|running|done
  const [log, setLog] = useState("");
  const [running, setRunning] = useState(false);

  const run = async () => {
    const tasks = parseArray(code, "tasks");
    const edges = parseArray(code, "edges") || [];
    if (!tasks) {
      setLog("✗ Could not find a 'tasks = [...]' list in your code.");
      return;
    }
    const lv = topoLevels(tasks, edges);
    setLevels(lv);
    setRunning(true);
    setLog("Scheduler started. Triggering DAG run…\n");
    const st = Object.fromEntries(tasks.map((t) => [t, "pending"]));
    setState({ ...st });

    for (const level of lv) {
      for (const t of level) st[t] = "running";
      setState({ ...st });
      setLog((l) => l + level.map((t) => `→ running ${t}`).join("\n") + "\n");
      await sleep(700);
      for (const t of level) st[t] = "done";
      setState({ ...st });
      setLog((l) => l + level.map((t) => `✓ ${t} success`).join("\n") + "\n");
      await sleep(200);
    }
    setLog((l) => l + "\n✓ DAG run complete — all tasks succeeded.");
    setRunning(false);
    onComplete?.();
  };

  const color = (s) =>
    s === "done"
      ? { bg: "#12352a", fg: "#3ddc97", br: "#3ddc97" }
      : s === "running"
      ? { bg: "#3a2f16", fg: "#f5b74e", br: "#f5b74e" }
      : { bg: "var(--surface-2)", fg: "var(--text-mute)", br: "var(--border)" };

  return (
    <div>
      <CodeEditor value={code} onChange={setCode} height="180px" />
      <div className="row mt-2">
        <button className="btn btn-success" onClick={run} disabled={running}>
          {running ? "Running DAG…" : "▶ Run DAG"}
        </button>
        <button className="btn btn-ghost" onClick={() => setCode(starter)} disabled={running}>
          ↺ Reset
        </button>
        <span className="spacer" />
        <span className="pill">🗓️ Airflow simulator</span>
      </div>

      {levels.length > 0 && (
        <div className="diagram mt-2" style={{ justifyContent: "flex-start" }}>
          {levels.map((level, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {level.map((t) => {
                  const c = color(state[t]);
                  return (
                    <div
                      key={t}
                      className="node"
                      style={{ background: c.bg, color: c.fg, border: `1px solid ${c.br}`, minWidth: 110 }}
                    >
                      {state[t] === "done" ? "✓ " : state[t] === "running" ? "⟳ " : ""}
                      {t}
                    </div>
                  );
                })}
              </div>
              {i < levels.length - 1 && <span className="arrow">→</span>}
            </div>
          ))}
        </div>
      )}

      {log && <div className="console mt-2">{log}</div>}
    </div>
  );
}
