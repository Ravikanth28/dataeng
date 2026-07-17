import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useProgress } from "../lib/useProgress.js";
import { useCourse } from "../context/CourseContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const { completed } = useProgress();
  const { tracks: TRACKS, totalLessons: TOTAL_LESSONS, allLessons: ALL_LESSONS } = useCourse();

  const done = completed.size;
  const pct = TOTAL_LESSONS ? Math.round((done / TOTAL_LESSONS) * 100) : 0;
  const nextUp = ALL_LESSONS.find((l) => !completed.has(l.id));

  return (
    <div className="content">
      <h1>Hey {user?.name?.split(" ")[0] || "there"} 👋</h1>
      <p>Welcome back. Here's your learning progress.</p>

      <div className="grid grid-3 mt-2">
        <div className="card">
          <div className="muted" style={{ fontSize: 13 }}>Overall progress</div>
          <div style={{ fontSize: 34, fontWeight: 800 }}>{pct}%</div>
          <div className="progress-track mt-1"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: 13 }}>Lessons completed</div>
          <div style={{ fontSize: 34, fontWeight: 800 }}>{done}<span className="muted" style={{ fontSize: 18 }}> / {TOTAL_LESSONS}</span></div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: 13 }}>Tracks</div>
          <div style={{ fontSize: 34, fontWeight: 800 }}>{TRACKS.length}</div>
        </div>
      </div>

      {nextUp && (
        <div className="card mt-3" style={{ borderColor: "var(--brand)" }}>
          <div className="row between wrap">
            <div>
              <span className="muted" style={{ fontSize: 13 }}>Continue where you left off</span>
              <h3 style={{ margin: "4px 0 0" }}>{nextUp.trackIcon} {nextUp.title}</h3>
            </div>
            <Link to={`/app/lesson/${nextUp.id}`} className="btn btn-primary">Resume →</Link>
          </div>
        </div>
      )}

      <h2 className="mt-4">Your tracks</h2>
      <div className="grid grid-2 mt-2">
        {TRACKS.map((t) => {
          const doneInTrack = t.lessons.filter((l) => completed.has(l.id)).length;
          const p = Math.round((doneInTrack / t.lessons.length) * 100);
          return (
            <Link key={t.id} to={`/app/track/${t.id}`} className="card card-hover">
              <div className="row" style={{ gap: 12 }}>
                <div style={{ fontSize: 28 }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>{t.title}</h3>
                  <span className="muted" style={{ fontSize: 13 }}>{doneInTrack}/{t.lessons.length} lessons</span>
                </div>
                <span className="pill">{p}%</span>
              </div>
              <div className="progress-track mt-2"><div className="progress-fill" style={{ width: `${p}%` }} /></div>
            </Link>
          );
        })}
      </div>

      <div className="card mt-3 row between wrap" style={{ background: "linear-gradient(135deg,#171b2e,#1c1730)" }}>
        <div>
          <h3 style={{ margin: 0 }}>🏆 Ready to build?</h3>
          <span className="muted">Wire Kafka → Spark → Airflow in the Project Builder.</span>
        </div>
        <Link to="/app/workspace" className="btn btn-primary">Open Project Builder</Link>
      </div>
    </div>
  );
}
