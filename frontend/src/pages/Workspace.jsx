import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor.jsx";
import BarChart from "../components/BarChart.jsx";
import { runPython } from "../lib/pyodide.js";
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

export default function Workspace() {
  const { projectId } = useParams();
  const [params] = useSearchParams();
  const template = useMemo(
    () => getCapstone(params.get("template") || CAPSTONES[0].id),
    [params]
  );

  const [title, setTitle] = useState(template.title);
  const [stages, setStages] = useState(() => template.stages.map((s) => ({ ...s })));
  const [orch, setOrch] = useState(() => ({ ...template.orchestrator }));
  const [selected, setSelected] = useState(template.stages[0].key);
  const [status, setStatus] = useState({});
  const [log, setLog] = useState("");
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState("");
  const [chart, setChart] = useState(null);
  const loadedId = useRef(null);

  // Reset when switching template (via query param).
  useEffect(() => {
    if (projectId) return;
    setTitle(template.title);
    setStages(template.stages.map((s) => ({ ...s })));
    setOrch({ ...template.orchestrator });
    setSelected(template.stages[0].key);
    setStatus({});
    setLog("");
  }, [template, projectId]);

  // Load an existing saved project.
  useEffect(() => {
    if (!projectId) return;
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
    })();
  }, [projectId]);

  const setStageCode = (key, code) =>
    setStages((s) => s.map((st) => (st.key === key ? { ...st, code } : st)));

  const append = (line) => setLog((l) => l + line + "\n");
  const setSt = (key, val) => setStatus((s) => ({ ...s, [key]: val }));

  const runPipeline = async () => {
    setRunning(true);
    setLog("");
    setStatus({});
    setChart(null);

    let orders = [];
    for (const stage of stages) {
      setSt(stage.key, "run");
      await sleep(300);

      if (stage.kind === "kafka") {
        const msgs = parseArrayLiteral(stage.code, "messages") || [];
        orders = msgs;
        append(`▶ ${stage.label}: sent ${msgs.length} events → topic`);
        await sleep(400);
      } else if (stage.kind === "spark") {
        append(`▶ ${stage.label}: running (real Python)…`);
        const inject = "orders = " + JSON.stringify(orders) + "\n";
        const res = await runPython(inject + stage.code, (m) => append("  " + m));
        append(res.output.trim().split("\n").map((l) => "  " + l).join("\n"));
        if (!res.ok) {
          append("✗ Spark stage failed.");
          setSt(stage.key, "err");
          setRunning(false);
          return;
        }
        if (res.table) setChart(res.table);
      } else if (stage.kind === "snowflake") {
        append(`▶ ${stage.label}: loading results into ${stage.table || "table"}…`);
        await sleep(500);
        append(`  ✓ loaded into Snowflake table '${stage.table || "results"}'`);
      }
      setSt(stage.key, "done");
    }

    // Airflow orchestrator animation
    setSt("orchestrator", "run");
    append("▶ Airflow: orchestrating DAG…");
    const tasks = parseArrayLiteral(orch.code, "tasks") || [];
    for (const t of tasks) {
      await sleep(350);
      append(`  ✓ ${t} success`);
    }
    setSt("orchestrator", "done");
    setSt("output", "done");
    append("\n✓ Pipeline complete — results in the warehouse.");
    setRunning(false);
  };

  const save = async () => {
    const content = JSON.stringify({ templateId: template.id, stages, orchestrator: orch });
    try {
      if (loadedId.current) {
        await api.updateProject(loadedId.current, { title, type: "capstone", content_json: content });
      } else {
        const p = await api.createProject({ title, type: "capstone", content_json: content });
        loadedId.current = p.id;
      }
      setSaved("Saved ✓");
      setTimeout(() => setSaved(""), 2000);
    } catch (e) {
      setSaved("Save failed: " + e.message);
    }
  };

  const dot = (s) =>
    s === "done" ? "var(--accent)" : s === "run" ? "var(--amber)" : s === "err" ? "var(--danger)" : "var(--text-mute)";

  const editingOrch = selected === "orchestrator";
  const current = editingOrch ? orch : stages.find((s) => s.key === selected);
  const schedule = orch.code.match(/schedule\s*=\s*"([^"]+)"/)?.[1] || "@daily";

  return (
    <div className="content" style={{ maxWidth: 1180 }}>
      {/* Toolbar */}
      <div className="row between wrap">
        <div className="row" style={{ gap: 10 }}>
          <span style={{ fontSize: 26 }}>{template.icon}</span>
          <input className="input" style={{ width: 300, fontWeight: 700 }} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="row">
          {saved && <span className="muted" style={{ fontSize: 13 }}>{saved}</span>}
          <button className="btn" onClick={save} disabled={running}>💾 Save</button>
          <button className="btn btn-success" onClick={runPipeline} disabled={running}>
            {running ? "Running…" : "▶ Run pipeline"}
          </button>
        </div>
      </div>

      {/* Airflow orchestration bar (clickable to edit the DAG) */}
      <div className="card mt-3" style={{ padding: 14 }}>
        <button
          onClick={() => setSelected("orchestrator")}
          className="pill"
          style={{
            color: "#6c8cff",
            borderColor: editingOrch ? "#6c8cff" : "rgba(108,140,255,.4)",
            cursor: "pointer",
            background: editingOrch ? "var(--surface-2)" : undefined,
          }}
        >
          🗓️ Airflow orchestrates · runs {schedule}
          <span style={{ marginLeft: 6, width: 8, height: 8, borderRadius: "50%", background: dot(status.orchestrator), display: "inline-block" }} />
        </button>

        {/* Pipeline canvas */}
        <div className="diagram mt-2" style={{ marginBottom: 0, borderStyle: "solid" }}>
          {stages.map((b, i) => (
            <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => setSelected(b.key)}
                className={`node ${status[b.key] === "run" ? "stage-active" : ""}`}
                style={{
                  background: selected === b.key ? "var(--surface-2)" : "var(--bg-2)",
                  color: b.color,
                  border: `2px solid ${selected === b.key ? b.color : status[b.key] === "done" ? "var(--accent)" : "var(--border)"}`,
                  cursor: "pointer",
                  minWidth: 118,
                  transition: "border-color .3s",
                }}
              >
                <div style={{ fontSize: 20 }} className={status[b.key] === "run" ? "spin" : ""}>{b.icon}</div>
                <div>{b.label}</div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: dot(status[b.key]) }} />
                  <span className="muted" style={{ fontSize: 11, marginLeft: 4 }}>{status[b.key] || "idle"}</span>
                </div>
              </button>
              <div className={`connector ${running ? "live" : ""}`} />
            </div>
          ))}
          <div
            className={`node ${status.output === "run" ? "stage-active" : ""}`}
            style={{ background: "#0f2a22", color: "var(--accent)", border: `2px solid ${status.output === "done" ? "var(--accent)" : "var(--border)"}`, minWidth: 110 }}
          >
            <div style={{ fontSize: 20 }}>📊</div>
            <div>Analytics</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{status.output || "idle"}</div>
          </div>
        </div>
      </div>

      {/* Editor + console */}
      <div className="grid mt-3" style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 16 }}>
        <div>
          <div className="row" style={{ gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{editingOrch ? "🗓️" : current?.icon}</span>
            <strong>{editingOrch ? "Airflow DAG" : current?.label}</strong>
            <span className="muted" style={{ fontSize: 12 }}>· click a block above to edit it</span>
          </div>
          <CodeEditor
            value={current?.code || ""}
            onChange={(c) => (editingOrch ? setOrch({ ...orch, code: c }) : setStageCode(selected, c))}
            height="320px"
          />
        </div>
        <div>
          <div className="row" style={{ gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16 }}>🖥️</span><strong>Output console</strong>
          </div>
          <div className="console" style={{ height: 320, maxHeight: 320 }}>
            {log || <span className="muted">Press ▶ Run pipeline to stream data through the whole pipeline. The Spark stage runs real Python.</span>}
          </div>
        </div>
      </div>

      {/* Results: warehouse table + animated chart */}
      {chart && (
        <div className="grid mt-3" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
          <div>
            <div className="row" style={{ gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>❄️</span><strong>Warehouse table (result)</strong>
            </div>
            <div className="card" style={{ padding: 0, overflowX: "auto" }}>
              <table className="tbl">
                <thead><tr>{chart.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>
                  {chart.rows.map((r, i) => (
                    <tr key={i}>{r.map((cell, j) => <td key={j}>{typeof cell === "number" ? cell.toLocaleString() : String(cell)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <BarChart table={chart} />
        </div>
      )}
    </div>
  );
}
