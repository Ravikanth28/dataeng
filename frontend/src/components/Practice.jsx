import PythonRunner from "./PythonRunner.jsx";
import DagSimulator from "./DagSimulator.jsx";
import KafkaSimulator from "./KafkaSimulator.jsx";
import SqlRunner from "./SqlRunner.jsx";

export default function Practice({ practice, onComplete }) {
  if (!practice) return null;

  const Runner =
    practice.type === "python"
      ? PythonRunner
      : practice.type === "sql"
      ? SqlRunner
      : practice.type === "dag"
      ? DagSimulator
      : practice.type === "kafka"
      ? KafkaSimulator
      : null;

  return (
    <div className="card mt-3" style={{ borderColor: "var(--brand)" }}>
      <div className="row" style={{ gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 22 }}>🧪</span>
        <h3 style={{ margin: 0 }}>Practice: {practice.title}</h3>
      </div>
      <p style={{ marginBottom: 16 }}>{practice.instructions}</p>
      {Runner ? (
        <Runner starter={practice.starter} onComplete={onComplete} />
      ) : (
        <div className="muted">Unknown practice type.</div>
      )}
    </div>
  );
}
