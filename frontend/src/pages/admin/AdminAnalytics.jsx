import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { useCourse } from "../../context/CourseContext.jsx";
import BarChart from "../../components/BarChart.jsx";

export default function AdminAnalytics() {
  const { getLesson } = useCourse();
  const [data, setData] = useState(null);

  useEffect(() => { api.adminAnalytics().then(setData).catch(() => setData({})); }, []);

  const cards = [
    { label: "Total users", value: data?.total_users, icon: "👥" },
    { label: "Lessons completed", value: data?.total_completions, icon: "📚" },
    { label: "Projects built", value: data?.total_projects, icon: "🧩" },
  ];

  const perLesson = (data?.per_lesson || []).map((r) => ({
    label: getLesson(r.lesson_id)?.title || r.lesson_id,
    value: r.completions,
  }));
  const chartTable = { columns: ["Lesson", "Completions"], rows: perLesson.map((r) => [r.label, r.value]) };

  return (
    <div className="content">
      <h1>📈 Analytics</h1>
      <p>Engagement across the platform.</p>

      <div className="grid grid-3 mt-2">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="muted" style={{ fontSize: 13 }}>{c.icon} {c.label}</div>
            <div style={{ fontSize: 34, fontWeight: 800 }}>{data ? (c.value ?? 0) : "…"}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-4">Most-completed lessons</h2>
      {perLesson.length === 0 ? (
        <p className="muted mt-2">No lesson completions recorded yet.</p>
      ) : (
        <>
          <BarChart table={chartTable} title="Completions per lesson" />
          <div className="card mt-2" style={{ padding: 0, overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>Lesson</th><th>Completions</th></tr></thead>
              <tbody>
                {perLesson.map((r, i) => (
                  <tr key={i}><td>{r.label}</td><td>{r.value}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
