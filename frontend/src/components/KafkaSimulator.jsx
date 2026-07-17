import { useState } from "react";
import CodeEditor from "./CodeEditor.jsx";

function parseMessages(code) {
  const m = code.match(/messages\s*=\s*(\[[\s\S]*?\])/m);
  if (!m) return null;
  let json = m[1].replace(/'/g, '"').replace(/#[^\n]*/g, "").replace(/,(\s*[\]}])/g, "$1");
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function parsePartitions(code) {
  const m = code.match(/partitions\s*=\s*(\d+)/);
  return m ? Math.max(1, Math.min(6, parseInt(m[1], 10))) : 3;
}
// Deterministic key -> partition (like Kafka's default partitioner).
function hashPartition(key, n) {
  let h = 0;
  for (const ch of String(key)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % n;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function KafkaSimulator({ starter, onComplete }) {
  const [code, setCode] = useState(starter);
  const [parts, setParts] = useState([]);
  const [consumed, setConsumed] = useState([]);
  const [log, setLog] = useState("");
  const [running, setRunning] = useState(false);

  const run = async () => {
    const messages = parseMessages(code);
    if (!messages) {
      setLog("✗ Could not find a 'messages = [...]' list in your code.");
      return;
    }
    const n = parsePartitions(code);
    const buckets = Array.from({ length: n }, () => []);
    setParts(buckets.map((b) => [...b]));
    setConsumed([]);
    setRunning(true);
    setLog("Producer connected → topic 'orders'\n");

    // Produce
    for (const msg of messages) {
      const p = hashPartition(msg.key ?? "", n);
      const offset = buckets[p].length;
      buckets[p].push({ ...msg, offset });
      setParts(buckets.map((b) => [...b]));
      setLog((l) => l + `→ produced key=${msg.key} → partition ${p} @ offset ${offset}\n`);
      await sleep(400);
    }

    // Consume (in offset order per partition)
    setLog((l) => l + "\nConsumer group 'analytics' reading…\n");
    const seen = [];
    for (let p = 0; p < n; p++) {
      for (const msg of buckets[p]) {
        seen.push({ ...msg, partition: p });
        setConsumed([...seen]);
        setLog((l) => l + `✓ consumed [p${p}@${msg.offset}] ${msg.value}\n`);
        await sleep(300);
      }
    }
    setLog((l) => l + `\n✓ Streamed ${messages.length} messages across ${n} partitions.`);
    setRunning(false);
    onComplete?.();
  };

  return (
    <div>
      <CodeEditor value={code} onChange={setCode} height="200px" />
      <div className="row mt-2">
        <button className="btn btn-success" onClick={run} disabled={running}>
          {running ? "Streaming…" : "▶ Run stream"}
        </button>
        <button className="btn btn-ghost" onClick={() => setCode(starter)} disabled={running}>
          ↺ Reset
        </button>
        <span className="spacer" />
        <span className="pill">🔀 Kafka simulator</span>
      </div>

      {parts.length > 0 && (
        <div className="grid grid-3 mt-2">
          {parts.map((bucket, p) => (
            <div key={p} className="card" style={{ padding: 12 }}>
              <div className="row between" style={{ marginBottom: 8 }}>
                <strong style={{ fontSize: 13 }}>Partition {p}</strong>
                <span className="pill" style={{ padding: "2px 8px" }}>{bucket.length} msg</span>
              </div>
              {bucket.length === 0 && <div className="muted" style={{ fontSize: 12 }}>empty</div>}
              {bucket.map((m) => (
                <div
                  key={m.offset}
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    padding: "5px 8px",
                    marginBottom: 5,
                    background: "var(--bg-2)",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                  }}
                >
                  <span className="muted">@{m.offset}</span> {m.value}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {consumed.length > 0 && (
        <div className="callout tip mt-2">
          <strong>Consumer read {consumed.length} messages</strong> — in order within each partition.
        </div>
      )}

      {log && <div className="console mt-2">{log}</div>}
    </div>
  );
}
