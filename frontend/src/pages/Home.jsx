import { Link } from "react-router-dom";
import { TRACKS } from "../data/course.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();
  return (
    <div>
      {/* Nav */}
      <div className="topbar" style={{ position: "static", background: "transparent" }}>
        <div className="logo"><span className="dot">◆</span> DataFlow Academy</div>
        <div className="row">
          {user ? (
            <Link to="/app/dashboard" className="btn btn-primary">Go to dashboard →</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/signup" className="btn btn-primary">Get started free</Link>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="content center" style={{ paddingTop: 60, paddingBottom: 30 }}>
        <span className="pill" style={{ marginBottom: 18 }}>🚀 Free · No install · Real code</span>
        <h1 style={{ fontSize: 52, letterSpacing: "-0.03em", maxWidth: 820, margin: "0 auto 18px" }}>
          Master <span className="gradient-text">Airflow, Spark & Kafka</span> by building real projects
        </h1>
        <p style={{ fontSize: 19, maxWidth: 640, margin: "0 auto 28px" }}>
          Learn data engineering from easy to advanced — with a real in-browser code editor,
          live Python execution, and a project builder that wires all three tools together.
        </p>
        <div className="row" style={{ justifyContent: "center", gap: 12 }}>
          <Link to="/signup" className="btn btn-primary btn-lg">Start learning free</Link>
          <Link to="/login" className="btn btn-lg">I have an account</Link>
        </div>
      </div>

      {/* Features */}
      <div className="content">
        <div className="grid grid-3">
          <div className="card">
            <div style={{ fontSize: 30 }}>🐍</div>
            <h3>Real Python, in your browser</h3>
            <p>Write PySpark/pandas and run it for real via Pyodide — no setup, actual output.</p>
          </div>
          <div className="card">
            <div style={{ fontSize: 30 }}>🧩</div>
            <h3>Project Builder</h3>
            <p>Wire Kafka → Spark → Airflow on a visual canvas and watch your data flow end to end.</p>
          </div>
          <div className="card">
            <div style={{ fontSize: 30 }}>📈</div>
            <h3>Track your progress</h3>
            <p>Your progress and projects are saved to your account so you can pick up anytime.</p>
          </div>
        </div>

        {/* Tracks preview */}
        <h2 className="mt-4">What you'll learn</h2>
        <div className="grid grid-2 mt-2">
          {TRACKS.map((t) => (
            <div key={t.id} className="card">
              <div className="row" style={{ gap: 12 }}>
                <div style={{ fontSize: 30 }}>{t.icon}</div>
                <div>
                  <h3 style={{ margin: 0 }}>{t.title}</h3>
                  <span className="muted" style={{ fontSize: 13 }}>{t.tagline} · {t.lessons.length} lessons</span>
                </div>
              </div>
              <p className="mt-2" style={{ marginBottom: 0 }}>{t.summary}</p>
            </div>
          ))}
        </div>

        <div className="card mt-4 center" style={{ background: "linear-gradient(135deg, #171b2e, #1c1730)" }}>
          <h2>Ready to become a data engineer?</h2>
          <p>Create a free account and build your first pipeline today.</p>
          <Link to="/signup" className="btn btn-primary btn-lg">Get started free</Link>
        </div>

        <p className="center muted mt-4" style={{ fontSize: 13 }}>
          DataFlow Academy · Built with React, FastAPI & TiDB
        </p>
      </div>
    </div>
  );
}
