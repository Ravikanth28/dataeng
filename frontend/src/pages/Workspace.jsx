import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor.jsx";
import BarChart from "../components/BarChart.jsx";
import { runPython } from "../lib/pyodide.js";
import { runSqlOnData } from "../lib/sqljs.js";
import { api } from "../lib/api.js";
import { CAPSTONES, getCapstone, STAGE_LIBRARY } from "../data/capstones.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Airflow schedule presets (cron's finest granularity is per-minute).
const SCHEDULE_OPTIONS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Hourly", value: "@hourly" },
  { label: "Daily", value: "@daily" },
  { label: "Weekly", value: "@weekly" },
];

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
// Build the REAL load SQL (CREATE + INSERT) from the Spark output — this is how
// the data actually lands in the warehouse.
function buildLoadSQL(tableName, data, loadMode) {
  if (!data || !data.rows.length) return "";
  const val = (c) => (typeof c === "number" ? String(c) : `'${String(c).replace(/'/g, "''")}'`);
  const rows = data.rows.map((r) => "  (" + r.map(val).join(", ") + ")").join(",\n");
  const pre = loadMode === "overwrite" ? `TRUNCATE TABLE ${tableName};\n` : "";
  return `-- ${loadMode.toUpperCase()} load generated from the Spark output\nCREATE TABLE IF NOT EXISTS ${tableName} (\n  ${data.columns.join(",\n  ")}\n);\n${pre}INSERT INTO ${tableName} (${data.columns.join(", ")}) VALUES\n${rows};`;
}
function sqlHighlight(sql) {
  return sql
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/(--[^\n]*)/g, '<span style="color:#6b7688">$1</span>')
    .replace(/\b(CREATE TABLE IF NOT EXISTS|CREATE TABLE|INSERT INTO|TRUNCATE TABLE|VALUES|SELECT|FROM|WHERE|GROUP BY|ORDER BY|RANK|OVER|PARTITION BY|CASE|WHEN|THEN|ELSE|END|AS|SUM|COUNT|ROUND|DESC|ASC)\b/g, '<span style="color:#6c8cff">$1</span>')
    .replace(/('[^']*')/g, '<span style="color:#7fd18c">$1</span>')
    .replace(/\b(\d+)\b/g, '<span style="color:#f5b74e">$1</span>');
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
  const [loadSql, setLoadSql] = useState(null);
  const [runs, setRuns] = useState([]);
  const loadedId = useRef(null);
  const consoleRef = useRef(null);
  const idCounter = useRef(1);
  const dragIndex = useRef(null);

  const addStage = (kind) => {
    const def = STAGE_LIBRARY[kind];
    if (!def) return;
    const key = `${kind}-${idCounter.current++}`;
    setStages((s) => [...s, { ...def, key }]);
    setSelected(key);
  };
  const removeStage = (key) => {
    setStages((s) => {
      const next = s.filter((x) => x.key !== key);
      if (selected === key) setSelected(next[0]?.key || "orchestrator");
      return next;
    });
  };
  const moveStage = (from, to) => {
    setStages((s) => {
      const next = [...s];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
  };

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

  // These dropdowns write straight into the Airflow DAG code (auto-sync).
  const setDagSchedule = (val) =>
    setOrch((o) => ({
      ...o,
      code: /schedule\s*=\s*"[^"]*"/.test(o.code)
        ? o.code.replace(/schedule\s*=\s*"[^"]*"/, `schedule = "${val}"`)
        : o.code.trimEnd() + `\nschedule = "${val}"`,
    }));
  const setDagRetries = (n) =>
    setOrch((o) => ({
      ...o,
      code: /retries"?\s*[:=]\s*\d+/.test(o.code)
        ? o.code.replace(/(retries"?\s*[:=]\s*)\d+/, `$1${n}`)
        : o.code,
    }));

  const runPipeline = async () => {
    setRunning(true); setLogs([]); setStatus({}); setMetrics({}); setChart(null); setWarehouse(null); setLoadSql(null);
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
        push("info", `loading into warehouse (mode: ${config.loadMode})…`);
        if (!sparkResult) push("warn", "no Spark result to load");
        else {
          // Show the REAL load happening: generated INSERT statements
          const loadSQL = buildLoadSQL(stage.table || "results", sparkResult, config.loadMode);
          setLoadSql(loadSQL);
          push("out", `-- data landing in '${stage.table || "results"}':`);
          loadSQL.split("\n").slice(0, 9).forEach((l) => push("out", l));
          if (sparkResult.rows.length > 5) push("info", `…and ${sparkResult.rows.length - 5} more rows`);
          push("ok", `${sparkResult.rows.length} rows stored in the warehouse`);
          // Now run the transform SQL on the loaded data
          push("info", "running transform SQL…");
          const res = await runSqlOnData("results", sparkResult, stage.code, (m) => push("info", m));
          if (!res.ok) { failed = true; failStage = stage.key; push("err", "SQL error: " + res.error); break; }
          setWarehouse({ columns: res.columns, rows: res.rows });
          push("ok", `transform SQL returned ${res.rows.length} rows`);
          setMetric(stage.key, `${sparkResult.rows.length} loaded`);
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
            🗓️ Airflow DAG (edit)
            <span style={{ marginLeft: 6, width: 8, height: 8, borderRadius: "50%", background: dot(status.orchestrator), display: "inline-block" }} />
          </button>
          {/* Pipeline config — these dropdowns write straight into the DAG code */}
          <div className="row wrap" style={{ gap: 12, fontSize: 12, alignItems: "center" }}>
            <label className="muted" style={{ display: "flex", alignItems: "center", gap: 6 }}>🗓️ Schedule
              <select value={schedule} onChange={(e) => setDagSchedule(e.target.value)} className="input" style={{ width: 150 }}>
                {!SCHEDULE_OPTIONS.some((o) => o.value === schedule) && <option value={schedule}>current: {schedule}</option>}
                {SCHEDULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="muted" style={{ display: "flex", alignItems: "center", gap: 6 }}>🔁 Retries
              <select value={retries} onChange={(e) => setDagRetries(+e.target.value)} className="input" style={{ width: 62 }}>
                {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label className="muted" style={{ display: "flex", alignItems: "center", gap: 6 }}>❄️ Load mode
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

        {/* Stage palette — click (or drag onto canvas) to add a stage */}
        <div className="row wrap mt-2" style={{ gap: 6, alignItems: "center" }}>
          <span className="muted" style={{ fontSize: 12 }}>➕ Add stage:</span>
          {Object.values(STAGE_LIBRARY).map((s) => (
            <button key={s.kind} onClick={() => addStage(s.kind)} disabled={running}
              draggable={!running} onDragStart={() => (dragIndex.current = `add:${s.kind}`)}
              className="pill" style={{ cursor: "pointer", color: s.color, borderColor: "var(--border-strong)" }}>
              + {s.icon} {s.label}
            </button>
          ))}
          <span className="muted" style={{ fontSize: 11 }}>· drag blocks to reorder · × to remove</span>
        </div>

        <div className="diagram mt-2" style={{ marginBottom: 0, borderStyle: "solid" }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => { if (typeof dragIndex.current === "string" && dragIndex.current.startsWith("add:")) { addStage(dragIndex.current.slice(4)); dragIndex.current = null; } }}>
          {stages.map((b, i) => (
            <div key={b.key}
              draggable={!running}
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.stopPropagation(); if (typeof dragIndex.current === "number" && dragIndex.current !== i) moveStage(dragIndex.current, i); dragIndex.current = null; }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative" }}>
                <button onClick={() => setSelected(b.key)} className={`node ${status[b.key] === "run" ? "stage-active" : ""}`}
                  style={{ background: selected === b.key ? "var(--surface-2)" : "var(--bg-2)", color: b.color,
                    border: `2px solid ${selected === b.key ? b.color : status[b.key] === "done" ? "var(--accent)" : status[b.key] === "err" ? "var(--danger)" : "var(--border)"}`,
                    cursor: "grab", minWidth: 112 }}>
                  <div style={{ fontSize: 19 }} className={status[b.key] === "run" ? "spin" : ""}>{b.icon}</div>
                  <div style={{ fontSize: 12 }}>{b.label}</div>
                  <div style={{ marginTop: 3 }}>
                    <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: dot(status[b.key]) }} />
                    <span className="muted" style={{ fontSize: 10, marginLeft: 4 }}>{metrics[b.key] || status[b.key] || "idle"}</span>
                  </div>
                </button>
                {!running && (
                  <span onClick={(e) => { e.stopPropagation(); removeStage(b.key); }} title="Remove stage"
                    style={{ position: "absolute", top: -7, right: -6, width: 18, height: 18, borderRadius: "50%", background: "var(--danger)", color: "#fff", fontSize: 12, display: "grid", placeItems: "center", cursor: "pointer", lineHeight: 1 }}>×</span>
                )}
              </div>
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

      {loadSql && (
        <div className="mt-3">
          <div className="row" style={{ gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16 }}>❄️</span>
            <strong>How the data was stored</strong>
            <span className="muted" style={{ fontSize: 12 }}>· auto-generated load SQL from the Spark output</span>
          </div>
          <div className="codeblock" style={{ maxHeight: 260, overflow: "auto", margin: 0 }}
            dangerouslySetInnerHTML={{ __html: sqlHighlight(loadSql) }} />
        </div>
      )}

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
