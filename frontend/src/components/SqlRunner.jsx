import { useState } from "react";
import CodeEditor from "./CodeEditor.jsx";
import { runSql } from "../lib/sqljs.js";

export default function SqlRunner({ starter, onComplete }) {
  const [code, setCode] = useState(starter);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setError("");
    setResult(null);
    setStatus("Starting SQL engine…");
    const res = await runSql(code, setStatus);
    setStatus("");
    setRunning(false);
    if (res.ok) {
      setResult(res);
      onComplete?.();
    } else {
      setError(res.error);
    }
  };

  return (
    <div>
      <CodeEditor value={code} onChange={setCode} height="200px" />
      <div className="row mt-2">
        <button className="btn btn-success" onClick={run} disabled={running}>
          {running ? "Running…" : "▶ Run SQL"}
        </button>
        <button className="btn btn-ghost" onClick={() => setCode(starter)} disabled={running}>
          ↺ Reset
        </button>
        {status && <span className="muted" style={{ fontSize: 13 }}>{status}</span>}
        <span className="spacer" />
        <span className="pill">❄️ real SQL · sql.js</span>
      </div>

      {error && <div className="console mt-2"><span className="err">✗ {error}</span></div>}

      {result && (
        result.rows.length === 0 ? (
          <div className="callout tip mt-2">{result.note || "No rows returned."}</div>
        ) : (
          <div className="card mt-2" style={{ padding: 0, overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>{result.columns.map((c) => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {result.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => <td key={j}>{String(cell)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="muted" style={{ fontSize: 12, padding: "8px 12px" }}>
              {result.rows.length} row{result.rows.length === 1 ? "" : "s"} · ✓ query ran
            </div>
          </div>
        )
      )}
    </div>
  );
}
