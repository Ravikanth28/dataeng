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
  } catch {
    return null;
  }
}

function buildInject(orders, dimensions) {
  let s = "import pandas as pd\norders = " + JSON.stringify(orders) + "\n";
  for (const [name, tbl] of Object.entries(dimensions || {})) {
    s += `${name} = pd.DataFrame(${JSON.stringify(tbl.rows)}, columns=${JSON.stringify(tbl.columns)})\n`;
  }
  return s;
}

export default function Workspace() {
  const { projectId } = useParams();
  const [params] = useSearchParams();
  const template = useMemo(() => getCapstone(params.get("template") || CAPSTONES[0].id), [params]);

  const [title, setTitle] = useState(template.title);
  const [stages, setStages] = useState(() => template.stages.map((s) => ({ ...s })));
  const [orch, setOrch] = useState(() => ({ ...template.orchestrator }));
  const [selected, setSelected] = useState(template.stages[0].key);
  const [status, setStatus] = useState({});
  const [metrics, setMetrics] = useState({});
  const [log, setLog] = useState("");
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState("");
  const [chart, setChart] = useState(null);
  const [warehouse, setWarehouse] = useState(null);
  const [runs, setRuns] = useState([]);
  const loadedId = useRef(null);

  useEffect(() => {
    if (projectId) return;
    setTitle(template.title);
    setStages(template.stages.map((s) => ({ ...s })));
    setOrch({ ...template.orchestrator });
    setSelected(template.stages[0].key);
    setStatus({}); setMetrics({}); setLog(""); setChart(null); setWarehouse(null);
  }, [template, projectId]);

  const loadRuns = async (pid) => {
    try { setRuns(await api.getRuns(pid)); } catch { setRuns([]); }
  };

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
        if (Array.isArray(c.stages) && c.stages[0]) setSelected(c.stages[0].key);
      } catch {}
      loadRuns(p.id);
    })();
  }, [projectId]);

  const setStageCode = (key, code) => setStages((s) => s.map((st) => (st.key === key ? { ...st, code } : st)));
  const setSt = (key, val) => setStatus((s) => ({ ...s, [key]: val }));
  const setMetric = (key, val) => setMetrics((m) => ({ ...m, [key]: val }));

  const runPipeline = async () => {
    setRunning(true); setLog(""); setStatus({}); setMetrics({}); setChart(null); setWarehouse(null);
    const t0 = Date.now();
    let logText = "";
    const append = (l) => { logText += l + "\n"; setLog(logText); };

    let orders = [];
    let sparkResult = null;
    let failed = false, failStage = null;

    for (const stage of stages) {
      setSt(stage.key, "run");
      await sleep(300);
      const s0 = Date.now();

      if (stage.kind === "kafka") {
        const msgs = parseArrayLiteral(stage.code, "messages") || [];
        orders = msgs;
        append(`▶ ${stage.label}: produced ${msgs.length} events → topic`);
        setMetric(stage.key, `${msgs.length} msgs`);
      } else if (stage.kind === "spark") {
        append(`▶ ${stage.label}: running (real Python)…`);
        const res = await runPython(buildInject(orders, template.dimensions) + "\n" + stage.code, (m) => append("  " + m));
        append(res.output.trim().split("\n").map((l) => "  " + l).join("\n"));
        if (!res.ok) { failed = true; failStage = stage.key; append("✗ Spark stage failed."); break; }
        sparkResult = res.table;
        if (res.table) setChart(res.table);
        setMetric(stage.key, `${orders.length}→${res.table ? res.table.rows.length : "?"} rows · ${Date.now() - s0}ms`);
      } else if (stage.kind === "quality") {
        append(`▶ ${stage.label}: validating data…`);
        const res = await runPython(stage.code, (m) => append("  " + m));
        append(res.output.trim().split("\n").map((l) => "  " + l).join("\n"));
        if (!res.ok) {
          failed = true; failStage = stage.key;
          append("✗ Data quality check FAILED — pipeline stopped (bad data not loaded).");
          break;
        }
        setMetric(stage.key, "✓ passed");
      } else if (stage.kind === "snowflake") {
        append(`▶ ${stage.label}: loading + transforming (real SQL)…`);
        if (!sparkResult) { append("  (no Spark result to load)"); }
        else {
          const res = await runSqlOnData("results", sparkResult, stage.code, (m) => append("  " + m));
          if (!res.ok) { failed = true; failStage = stage.key; append("✗ SQL error: " + res.error); break; }
          setWarehouse({ columns: res.columns, rows: res.rows });
          append(`  ✓ loaded ${sparkResult.rows.length} rows into '${stage.table}', ran SQL → ${res.rows.length} rows`);
          setMetric(stage.key, `${res.rows.length} rows`);
        }
      }
      setSt(stage.key, "done");
      await sleep(120);
    }

    if (failed) {
      setSt(failStage, "err");
    } else {
      setSt("orchestrator", "run");
      append("▶ Airflow: orchestrating DAG…");
      const tasks = parseArrayLiteral(orch.code, "tasks") || [];
      for (const t of tasks) { await sleep(300); append(`  ✓ ${t} success`); }
      setSt("orchestrator", "done");
      setSt("output", "done");
      append("\n✓ Pipeline complete — results in the warehouse.");
    }

    const duration = Date.now() - t0;
    setRunning(false);
    try {
      await api.createRun({
        project_id: loadedId.current || null, title, template_id: template.id,
        status: failed ? "failed" : "success", duration_ms: duration, log: logText.slice(0, 4000),
      });
      loadRuns(loadedId.current || undefined);
    } catch {}
  };

  const save = async () => {
    const content = JSON.stringify({ templateId: template.id, stages, orchestrator: orch });
    try {
      if (loadedId.current) await api.updateProject(loadedId.current, { title, type: "capstone", content_json: content });
      else { const p = await api.createProject({ title, type: "capstone", content_json: content }); loadedId.current = p.id; }
      setSaved("Saved ✓");
      setTimeout(() => setSaved(""), 2000);
    } catch (e) { setSaved("Save failed: " + e.message); }
  };

  const dot = (s) => s === "done" ? "var(--accent)" : s === "run" ? "var(--amber)" : s === "err" ? "var(--danger)" : "var(--text-mute)";
  const editingOrch = selected === "orchestrator";
  const current = editingOrch ? orch : stages.find((s) => s.key === selected);
  const schedule = orch.code.match(/schedule\s*=\s*"([^"]+)"/)?.[1] || "@daily";

  return (
    <div className="content" style={{ maxWidth: 1180 }}>
      <div className="row between wrap">
        <div className="row" style={{ gap: 10 }}>
          <span style={{ fontSize: 26 }}>{template.icon}</span>
          <input className="input" style={{ width: 300, fontWeight: 700 }} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="row">
          {saved && <span className="muted" style={{ fontSize: 13 }}>{saved}</span>}
          <button className="btn" onClick={save} disabled={running}>💾 Save</button>
          <button className="btn btn-success" onClick={runPipeline} disabled={running}>{running ? "Running…" : "▶ Run pipeline"}</button>
        </div>
      </div>

      <div className="card mt-3" style={{ padding: 14 }}>
        <button onClick={() => setSelected("orchestrator")} className="pill"
          style={{ color: "#6c8cff", borderColor: editingOrch ? "#6c8cff" : "rgba(108,140,255,.4)", cursor: "pointer", background: editingOrch ? "var(--surface-2)" : undefined }}>
          🗓️ Airflow orchestrates · runs {schedule}
          <span style={{ marginLeft: 6, width: 8, height: 8, borderRadius: "50%", background: dot(status.orchestrator), display: "inline-block" }} />
        </button>

        <div className="diagram mt-2" style={{ marginBottom: 0, borderStyle: "solid" }}>
          {stages.map((b) => (
            <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setSelected(b.key)} className={`node ${status[b.key] === "run" ? "stage-active" : ""}`}
                style={{ background: selected === b.key ? "var(--surface-2)" : "var(--bg-2)", color: b.color,
                  border: `2px solid ${selected === b.key ? b.color : status[b.key] === "done" ? "var(--accent)" : status[b.key] === "err" ? "var(--danger)" : "var(--border)"}`,
                  cursor: "pointer", minWidth: 116 }}>
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
            style={{ background: "#0f2a22", color: "var(--accent)", border: `2px solid ${status.output === "done" ? "var(--accent)" : "var(--border)"}`, minWidth: 104 }}>
            <div style={{ fontSize: 19 }}>📊</div>
            <div style={{ fontSize: 12 }}>Analytics</div>
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
          <div className="row" style={{ gap: 8, marginBottom: 8 }}><span style={{ fontSize: 16 }}>🖥️</span><strong>Output console</strong></div>
          <div className="console" style={{ height: 300, maxHeight: 300 }}>
            {log || <span className="muted">Press ▶ Run pipeline. Kafka → Spark (real Python) → Data quality → Snowflake (real SQL), orchestrated by Airflow.</span>}
          </div>
        </div>
      </div>

      {(chart || warehouse) && (
        <div className="grid mt-3" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
          {warehouse && (
            <div>
              <div className="row" style={{ gap: 8, marginBottom: 8 }}><span style={{ fontSize: 16 }}>❄️</span><strong>Warehouse table (after SQL)</strong></div>
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
