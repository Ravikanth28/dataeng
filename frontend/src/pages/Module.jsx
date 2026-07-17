import { Link, useParams } from "react-router-dom";
import { useCourse } from "../context/CourseContext.jsx";
import { useProgress } from "../lib/useProgress.js";

const levelClass = { easy: "pill-easy", medium: "pill-medium", advanced: "pill-advanced" };

export default function Module() {
  const { trackId } = useParams();
  const { getTrack } = useCourse();
  const track = getTrack(trackId);
  const { completed } = useProgress();

  if (!track) return <div className="content">Track not found.</div>;

  const done = track.lessons.filter((l) => completed.has(l.id)).length;
  const pct = Math.round((done / track.lessons.length) * 100);

  return (
    <div className="content">
      <Link to="/app/catalog" className="muted" style={{ fontSize: 13 }}>← All tracks</Link>
      <div className="row mt-1" style={{ gap: 14 }}>
        <div style={{ fontSize: 40 }}>{track.icon}</div>
        <div>
          <h1 style={{ margin: 0 }}>{track.title}</h1>
          <p style={{ margin: "4px 0 0" }}>{track.summary}</p>
        </div>
      </div>

      <div className="progress-track mt-3"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
      <div className="muted mt-1" style={{ fontSize: 13 }}>{done}/{track.lessons.length} completed · {pct}%</div>

      <div className="mt-3" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {track.lessons.map((l, i) => {
          const isDone = completed.has(l.id);
          return (
            <Link key={l.id} to={`/app/lesson/${l.id}`} className="card card-hover">
              <div className="row between wrap">
                <div className="row" style={{ gap: 14 }}>
                  <div
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      display: "grid", placeItems: "center", fontWeight: 700,
                      background: isDone ? "var(--accent)" : "var(--surface-2)",
                      color: isDone ? "#04150e" : "var(--text-mute)",
                      flexShrink: 0,
                    }}
                  >
                    {isDone ? "✓" : i + 1}
                  </div>
                  <div>
                    <strong>{l.title}</strong>
                    <div className="muted" style={{ fontSize: 12 }}>{l.minutes} min read{l.practice ? " · 🧪 hands-on" : ""}</div>
                  </div>
                </div>
                <span className={`pill ${levelClass[l.level]}`}>{l.level}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
