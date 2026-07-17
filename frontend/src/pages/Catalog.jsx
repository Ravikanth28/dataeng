import { Link } from "react-router-dom";
import { useCourse } from "../context/CourseContext.jsx";
import { useProgress } from "../lib/useProgress.js";

export default function Catalog() {
  const { tracks: TRACKS } = useCourse();
  const { completed } = useProgress();
  return (
    <div className="content">
      <h1>All tracks</h1>
      <p>Work through them in order, or jump to what you need.</p>
      <div className="grid grid-2 mt-2">
        {TRACKS.map((t) => {
          const done = t.lessons.filter((l) => completed.has(l.id)).length;
          const pct = Math.round((done / t.lessons.length) * 100);
          return (
            <Link key={t.id} to={`/app/track/${t.id}`} className="card card-hover">
              <div className="row" style={{ gap: 12 }}>
                <div style={{ fontSize: 32 }}>{t.icon}</div>
                <div>
                  <h3 style={{ margin: 0 }}>{t.title}</h3>
                  <span className="muted" style={{ fontSize: 13 }}>{t.tagline}</span>
                </div>
              </div>
              <p className="mt-2">{t.summary}</p>
              <div className="row between">
                <span className="muted" style={{ fontSize: 13 }}>{done}/{t.lessons.length} lessons</span>
                <span className="pill">{pct}%</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
