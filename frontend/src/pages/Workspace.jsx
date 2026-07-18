import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor.jsx";
import BarChart from "../components/BarChart.jsx";
import { runPython } from "../lib/pyodide.js";
import { runSqlOnData } from "../lib/sqljs.js";
import { api } from "../lib/api.js";
import { CAPSTONES, getCapstone } from "../data/capstones.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArrayLiteral(code, name) {
  const m = code.match(new RegExp(`${name}\\s*=\\s*(\\[[\\s\\S]*?\\])`, "m"));
  if (!m) return null;
  try {
    return JSON.parse(m[1].replace(/'/g, '"').replace(/#[^\n]*/g, "").replace(/,(\s*[\]}])/g, "$1"));
  } catch { return null; }
}
function buildInject(orders, dimensions) {
  let s = "import pandas as pd\norders = " + JSON.stringify(orders) + "\n";
  for (const [name, tbl] of Object.entries(dimensions || {}))
    s += `${name} = pd.DataFrame(${JSON.stringify(tbl.rows)}, columns=${JSON.stringify(tbl.columns)})\n`;
  return s;
}
function toCSV(t) {
  const esc = (c) => (typeof c === "string" && /[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
  return [t.columns.join(","), ...t.rows.map((r) => r.map(esc).join(","))].join("\n");
}
function toJSON(t) {
  return JSON.stringify(t.rows.map((r) => Object.fromEntries(t.columns.map((c, i) => [c, r[i]]))), null, 2);
}
function download(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Workspace() {
  const { projectId } = useParams();
  const [params] = useSearchParams();
  const template = useMemo(() => getCapstone(params.get("template") || CAPSTONES[0].id), [params]);

  const [title, setTitle] = useState(template.title);
  const [stages, setStages] = useState(() => template.stages.map((s) => ({ ...s })));
  const [orch, setOrch] = useState(() => ({ ...template.orchestrator }));
  const [config, setConfig] = useState({ loadMode: "append", injectFail: "" });
  const [selected, setSelected] = useState(template.stages[0].key);
  const [status, setStatus] = useState({});
  const [metrics, setMetrics] = useState({});
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState("");
  const [chart, setChart] = useState(null);
  const [warehouse, setWarehouse] = useState(null);
  const [runs, setRuns] = useState([]);
  const loadedId = useRef(null);
  const consoleRef = useRef(null);

  useEffect(() => {
    if (projectId) return;
    setTitle(template.title);
    setStages(template.stages.map((s) => ({ ...s })));
    setOrch({ ...template.orchestrator });
    setConfig({ loadMode: "append", injectFail: "" });
    setSelected(template.stages[0].key);
    setStatus({}); setMetrics({}); setLogs([]); setChart(null); setWarehouse(null);
  }, [template, projectId]);

  const loadRuns = async (pid) => { try { setRuns(await api.getRuns(pid)); } catch { setRuns([]); } };

  useEffect(() => {
    if (!projectId) { loadRuns(); return; }
    (async () => {
      const list = await api.getProjects();
      const p = list.find((x) => String(x.id) === String(projectId));
      if (!p) return;
      loadedId.current = p.id;
      setTitle(p.title);
      try {
        const c = JSON.parse(p.content_json || "{}");
        if (Array.isArray(c.stages)) setStages(c.stages);
        if (c.orchestrator) setOrch(c.orchestrator);
        if (c.config) setConfig((cf) => ({ ...cf, ...c.config }));
        if (Array.isArray(c.stages) && c.stages[0]) setSelected(c.stages[0].key);
      } catch {}
      loadRuns(p.id);
    })();
  }, [projectId]);

  useEffect(() => {
    if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [logs]);

  const setStageCode = (key, code) => setStages((s) => s.map((st) => (st.key === key ? { ...st, code } : st)));
  const setSt = (key, val) => setStatus((s) => ({ ...s, [key]: val }));
  const setMetric = (key, val) => setMetrics((m) => ({ ...m, [key]: val }));

  const runPipeline = async () => {
    setRunning(true); setLogs([]); setStatus({}); setMetrics({}); setChart(null); setWarehouse(null);
    const t0 = Date.now();
    // Retry limit comes from the Airflow DAG's default_args (real Airflow style).
    const dagRetries = parseInt(orch.code.match(/retries["']?\s*[:=]\s*(\d+)/)?.[1] ?? "0", 10);
    const entries = [];
    const push = (type, text) => { entries.push({ type, text }); setLogs([...entries]); };

    let orders = [], sparkResult = null, failed = false, failStage = null;

    for (const stage of stages) {
      setSt(stage.key, "run");
      await sleep(300);
      push("head", `${stage.icon} ${stage.label}`);
      const s0 = Date.now();

      // Retry & failure simulation (Airflow-style)
      if (stage.key === config.injectFail) {
        if (dagRetries >= 1) {
          push("warn", `attempt 1 failed — injected failure 💥`);
          for (let a = 1; a <= dagRetries; a++) {
            push("info", `↻ Airflow retrying (${a}/${dagRetries}) — retry limit from DAG default_args…`);
            await sleep(450);
          }
          push("ok", `recovered on retry — task is idempotent, so re-running was safe`);
        } else {
          push("err", `failed and retries = 0 in the DAG → pipeline stopped`);
          failed = true; failStage = stage.key; break;
        }
      }

      if (stage.kind === "kafka") {
        const msgs = parseArrayLiteral(stage.code, "messages") || [];
        orders = msgs;
        push("info", `→ produced ${msgs.length} events to topic`);
        push("ok", `${msgs.length} messages sent`);
        setMetric(stage.key, `${msgs.length} msgs`);
      } else if (stage.kind === "spark") {
        push("info", `running distributed job (real Python)…`);
        const res = await runPython(buildInject(orders, template.dimensions) + "\n" + stage.code, (m) => push("info", m));
        res.output.trim().split("\n").forEach((l) => l && push("out", l));
        if (!res.ok) { failed = true; failStage = stage.key; push("err", "Spark stage failed"); break; }
        sparkResult = res.table;
        if (res.table) setChart(res.table);
        const out = res.table ? res.table.rows.length : "?";
        push("ok", `processed ${orders.length} in → ${out} out (${Date.now() - s0}ms)`);
        setMetric(stage.key, `${orders.length}→${out} · ${Date.now() - s0}ms`);
      } else if (stage.kind === "quality") {
        push("info", `validating data (assertions)…`);
        const res = await runPython(stage.code, (m) => push("info", m));
        res.output.trim().split("\n").forEach((l) => l && push("out", l));
        if (!res.ok) {
          failed = true; failStage = stage.key;
          push("err", "DATA QUALITY CHECK FAILED — bad data blocked, pipeline stopped");
          break;
        }
        push("ok", "all quality checks passed");
        setMetric(stage.key, "✓ passed");
      } else if (stage.kind === "snowflake") {
        push("info", `loading into warehouse (mode: ${config.loadMode}) + running SQL…`);
        if (!sparkResult) push("warn", "no Spark result to load");
        else {
          const res = await runSqlOnData("results", sparkResult, stage.code, (m) => push("info", m));
          if (!res.ok) { failed = true; failStage = stage.key; push("err", "SQL error: " + res.error); break; }
          setWarehouse({ columns: res.columns, rows: res.rows });
          push("ok", `loaded ${sparkResult.rows.length} rows into '${stage.table}' → SQL returned ${res.rows.length} rows`);
          setMetric(stage.key, `${res.rows.length} rows`);
        }
      }
      setSt(stage.key, "done");
      await sleep(120);
    }

    if (failed) {
      setSt(failStage, "err");
      push("head", "❌ Pipeline failed");
    } else {
      setSt("orchestrator", "run");
      push("head", "🗓️ Airflow — marking DAG run successful");
      const tasks = parseArrayLiteral(orch.code, "tasks") || [];
      for (const t of tasks) { await sleep(250); push("ok", `${t}`); }
      setSt("orchestrator", "done"); setSt("output", "done");
      push("head", "✅ Pipeline complete — data is in the warehouse");
    }

    const duration = Date.now() - t0;
    setRunning(false);
    try {
      await api.createRun({
        project_id: loadedId.current || null, title, template_id: template.id,
        status: failed ? "failed" : "success", duration_ms: duration,
        log: entries.map((e) => e.text).join("\n").slice(0, 4000),
      });
      loadRuns(loadedId.current || undefined);
    } catch {}
  };

  const save = async () => {
    const content = JSON.stringify({ templateId: template.id, stages, orchestrator: orch, config });
    try {
      if (loadedId.current) await api.updateProject(loadedId.current, { title, type: "capstone", content_json: content });
      else { const p = await api.createProject({ title, type: "capstone", content_json: content }); loadedId.current = p.id; }
      setSaved("Saved ✓"); setTimeout(() => setSaved(""), 2000);
    } catch (e) { setSaved("Save failed: " + e.message); }
  };

  const dot = (s) => s === "done" ? "var(--accent)" : s === "run" ? "var(--amber)" : s === "err" ? "var(--danger)" : "var(--text-mute)";
  const editingOrch = selected === "orchestrator";
  const current = editingOrch ? orch : stages.find((s) => s.key === selected);
  const schedule = orch.code.match(/schedule\s*=\s*"([^"]+)"/)?.[1] || "@daily";
  const retries = parseInt(orch.code.match(/retries["']?\s*[:=]\s*(\d+)/)?.[1] ?? "0", 10);

  const logStyle = (type) => ({
    head: { color: "#e7ebf2", fontWeight: 600, marginTop: 8, borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 6 },
    info: { color: "#8b93a7", paddingLeft: 16 },
    out: { color: "#c8ccd0", paddingLeft: 16, fontFamily: "var(--mono)" },
    ok: { color: "#7fd18c", paddingLeft: 16 },
    warn: { color: "#f5b74e", paddingLeft: 16 },
    err: { color: "#ff8080", fontWeight: 600, paddingLeft: 16 },
  }[type] || {});
  const logPrefix = (type) => ({ info: "", out: "", ok: "✓ ", warn: "⚠ ", err: "✗ " }[type] || "");

  const sinkTable = stages.find((s) => s.kind === "snowflake")?.table || "warehouse";

  return (
    <div className="content" style={{ maxWidth: 1180 }}>
      <div className="row between wrap">
        <div className="row" style={{ gap: 10 }}>
          <span style={{ fontSize: 26 }}>{template.icon}</span>
          <input className="input" style={{ width: 280, fontWeight: 700 }} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="row">
          {saved && <span className="muted" style={{ fontSize: 13 }}>{saved}</span>}
          <button className="btn" onClick={save} disabled={running}>💾 Save</button>
          <button className="btn btn-success" onClick={runPipeline} disabled={running}>{running ? "Running…" : "▶ Run pipeline"}</button>
        </div>
      </div>

      <div className="card mt-3" style={{ padding: 14 }}>
        <div className="row between wrap" style={{ gap: 10 }}>
          <button onClick={() => setSelected("orchestrator")} className="pill"
            style={{ color: "#6c8cff", borderColor: editingOrch ? "#6c8cff" : "rgba(108,140,255,.4)", cursor: "pointer", background: editingOrch ? "var(--surface-2)" : undefined }}>
            🗓️ Airflow · {schedule}
            <span style={{ marginLeft: 6, width: 8, height: 8, borderRadius: "50%", background: dot(status.orchestrator), display: "inline-block" }} />
          </button>
          {/* Pipeline config */}
          <div className="row wrap" style={{ gap: 12, fontSize: 12, alignItems: "center" }}>
            <button className="pill" onClick={() => setSelected("orchestrator")} title="Set in the Airflow DAG default_args" style={{ cursor: "pointer" }}>
              🔁 retries: <strong style={{ color: "var(--text)" }}>{retries}</strong> <span className="muted">· set in DAG</span>
            </button>
            <label className="muted" style={{ display: "flex", alignItems: "center", gap: 6 }}>Load mode
              <select value={config.loadMode} onChange={(e) => setConfig({ ...config, loadMode: e.target.value })} className="input" style={{ width: 116 }}>
                <option value="append">append</option><option value="overwrite">overwrite</option><option value="merge">merge</option>
              </select>
            </label>
            <label className="muted" style={{ display: "flex", alignItems: "center", gap: 6 }}>💥 Inject failure
              <select value={config.injectFail} onChange={(e) => setConfig({ ...config, injectFail: e.target.value })} className="input" style={{ width: 130 }}>
                <option value="">none</option>
                {stages.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="diagram mt-2" style={{ marginBottom: 0, borderStyle: "solid" }}>
          {stages.map((b) => (
            <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setSelected(b.key)} className={`node ${status[b.key] === "run" ? "stage-active" : ""}`}
                style={{ background: selected === b.key ? "var(--surface-2)" : "var(--bg-2)", color: b.color,
                  border: `2px solid ${selected === b.key ? b.color : status[b.key] === "done" ? "var(--accent)" : status[b.key] === "err" ? "var(--danger)" : "var(--border)"}`,
                  cursor: "pointer", minWidth: 112 }}>
                <div style={{ fontSize: 19 }} className={status[b.key] === "run" ? "spin" : ""}>{b.icon}</div>
                <div style={{ fontSize: 12 }}>{b.label}</div>
                <div style={{ marginTop: 3 }}>
                  <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: dot(status[b.key]) }} />
                  <span className="muted" style={{ fontSize: 10, marginLeft: 4 }}>{metrics[b.key] || status[b.key] || "idle"}</span>
                </div>
              </button>
              <div className={`connector ${running ? "live" : ""}`} />
            </div>
          ))}
          <div className={`node ${status.output === "run" ? "stage-active" : ""}`}
            style={{ background: "#0f2a22", color: "var(--accent)", border: `2px solid ${status.output === "done" ? "var(--accent)" : "var(--border)"}`, minWidth: 100 }}>
            <div style={{ fontSize: 19 }}>📊</div><div style={{ fontSize: 12 }}>Analytics</div>
            <div className="muted" style={{ fontSize: 10, marginTop: 3 }}>{status.output || "idle"}</div>
          </div>
        </div>
      </div>

      <div className="grid mt-3" style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 16 }}>
        <div>
          <div className="row" style={{ gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{editingOrch ? "🗓️" : current?.icon}</span>
            <strong>{editingOrch ? "Airflow DAG" : current?.label}</strong>
            <span className="muted" style={{ fontSize: 12 }}>· click a block above to edit it</span>
          </div>
          <CodeEditor value={current?.code || ""} onChange={(c) => (editingOrch ? setOrch({ ...orch, code: c }) : setStageCode(selected, c))} height="300px" />
        </div>
        <div>
          <div className="row between" style={{ marginBottom: 8 }}>
            <div className="row" style={{ gap: 8 }}><span style={{ fontSize: 16 }}>🖥️</span><strong>Run console</strong></div>
            {running && <span className="pill blink" style={{ color: "var(--amber)", padding: "2px 8px" }}>● running</span>}
          </div>
          <div className="console" ref={consoleRef} style={{ height: 300, maxHeight: 300 }}>
            {logs.length === 0
              ? <span className="muted">Press ▶ Run pipeline. Each stage streams its logs here — colour-coded by status.</span>
              : logs.map((e, i) => <div key={i} style={logStyle(e.type)}>{logPrefix(e.type)}{e.text}</div>)}
          </div>
        </div>
      </div>

      {(chart || warehouse) && (
        <div className="grid mt-3" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
          {warehouse && (
            <div>
              <div className="row between" style={{ marginBottom: 8 }}>
                <div className="row" style={{ gap: 8 }}><span style={{ fontSize: 16 }}>❄️</span><strong>Warehouse: {sinkTable}</strong></div>
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => download(`${sinkTable}.csv`, toCSV(warehouse), "text/csv")}>⬇ CSV</button>
                  <button className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => download(`${sinkTable}.json`, toJSON(warehouse), "application/json")}>⬇ JSON</button>
                </div>
              </div>
              <div className="card" style={{ padding: 0, overflowX: "auto" }}>
                <table className="tbl">
                  <thead><tr>{warehouse.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                  <tbody>{warehouse.rows.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j}>{typeof cell === "number" ? cell.toLocaleString() : String(cell)}</td>)}</tr>)}</tbody>
                </table>
              </div>
            </div>
          )}
          {chart && <BarChart table={chart} title="Spark aggregation" />}
        </div>
      )}

      {/* Run history */}
      <h3 className="mt-4">🕒 Run history</h3>
      {runs.length === 0 ? (
        <p className="muted">No runs yet. Press ▶ Run pipeline.</p>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Status</th><th>Template</th><th>Duration</th><th>When</th></tr></thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id}>
                  <td><span className={`pill ${r.status === "success" ? "pill-easy" : "pill-advanced"}`}>{r.status === "success" ? "✓ success" : "✗ failed"}</span></td>
                  <td className="muted">{r.template_id || "—"}</td>
                  <td>{(r.duration_ms / 1000).toFixed(1)}s</td>
                  <td className="muted">{r.created_at ? new Date(r.created_at).toLocaleString() : "just now"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
