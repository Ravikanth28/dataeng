import { useState } from "react";
import CodeEditor from "./CodeEditor.jsx";
import BarChart from "./BarChart.jsx";
import { runPython } from "../lib/pyodide.js";

export default function PythonRunner({ starter, onComplete }) {
  const [code, setCode] = useState(starter);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);
  const [ok, setOk] = useState(null);
  const [table, setTable] = useState(null);

  const run = async () => {
    setRunning(true);
    setOk(null);
    setOutput("");
    setTable(null);
    setStatus("Starting Python…");
    const res = await runPython(code, setStatus);
    setOutput(res.output.trim() || "(no output)");
    setTable(res.table || null);
    setOk(res.ok);
    setStatus("");
    setRunning(false);
    if (res.ok) onComplete?.();
  };

  return (
    <div>
      <CodeEditor value={code} onChange={setCode} />
      <div className="row mt-2" style={{ gap: 10 }}>
        <button className="btn btn-success" onClick={run} disabled={running}>
          {running ? "Running…" : "▶ Run Python"}
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => setCode(starter)}
          disabled={running}
        >
          ↺ Reset
        </button>
        {status && <span className="muted" style={{ fontSize: 13 }}>{status}</span>}
        <span className="spacer" />
        <span className="pill">🐍 real Python · Pyodide</span>
      </div>
      {output && (
        <div className="console mt-2">
          {ok === false && <div className="err">✗ Error</div>}
          {output}
          {ok && <div className="ok" style={{ marginTop: 8 }}>✓ Ran successfully</div>}
        </div>
      )}

      {table && <BarChart table={table} />}
    </div>
  );
}
