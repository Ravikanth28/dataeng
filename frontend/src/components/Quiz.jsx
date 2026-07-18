import { useState } from "react";

const PASS = 0.6;

export default function Quiz({ questions, onPass }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const score = questions.filter((q, i) => answers[i] === q.answer).length;
  const pct = Math.round((score / questions.length) * 100);
  const passed = score / questions.length >= PASS;

  const submit = () => {
    setSubmitted(true);
    if (passed) onPass?.(pct);
  };
  const reset = () => { setAnswers({}); setSubmitted(false); };

  return (
    <div>
      {questions.map((q, i) => (
        <div key={i} className="card" style={{ marginBottom: 14 }}>
          <strong>{i + 1}. {q.q}</strong>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {q.options.map((opt, j) => {
              const chosen = answers[i] === j;
              let border = "var(--border-strong)", bg = "var(--bg-2)";
              if (submitted) {
                if (j === q.answer) { border = "var(--accent)"; bg = "rgba(61,220,151,.12)"; }
                else if (chosen) { border = "var(--danger)"; bg = "rgba(255,107,107,.12)"; }
              } else if (chosen) { border = "var(--brand)"; }
              return (
                <button key={j} disabled={submitted}
                  onClick={() => setAnswers({ ...answers, [i]: j })}
                  style={{ textAlign: "left", padding: "10px 12px", borderRadius: "var(--radius-sm)",
                    border: `1px solid ${border}`, background: bg, color: "var(--text)", cursor: submitted ? "default" : "pointer", fontFamily: "inherit", fontSize: 14 }}>
                  {submitted && j === q.answer ? "✓ " : submitted && chosen ? "✗ " : ""}{opt}
                </button>
              );
            })}
          </div>
          {submitted && <div className="callout tip" style={{ marginTop: 10, marginBottom: 0 }}>{q.explain}</div>}
        </div>
      ))}

      {!submitted ? (
        <button className="btn btn-primary" onClick={submit} disabled={Object.keys(answers).length < questions.length}>
          Submit quiz ({Object.keys(answers).length}/{questions.length} answered)
        </button>
      ) : (
        <div className="card" style={{ borderColor: passed ? "var(--accent)" : "var(--amber)" }}>
          <h2 style={{ margin: 0 }}>{passed ? "🎉 Passed!" : "Keep trying!"} {score}/{questions.length} ({pct}%)</h2>
          <p style={{ marginBottom: 12 }}>{passed ? "Great work — you've got this track down." : `You need ${Math.ceil(PASS * questions.length)}/${questions.length} to pass. Review the explanations and retry.`}</p>
          <button className="btn" onClick={reset}>↺ Retry quiz</button>
        </div>
      )}
    </div>
  );
}
