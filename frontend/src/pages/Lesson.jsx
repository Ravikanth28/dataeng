import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useCourse } from "../context/CourseContext.jsx";
import { useProgress } from "../lib/useProgress.js";
import Practice from "../components/Practice.jsx";

export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { getLesson, nextLesson } = useCourse();
  const lesson = getLesson(lessonId);
  const { completed, markComplete } = useProgress();
  const [practiceDone, setPracticeDone] = useState(false);

  if (!lesson) return <div className="content">Lesson not found.</div>;

  const isDone = completed.has(lesson.id);
  const next = nextLesson(lesson.id);
  const canComplete = !lesson.practice || practiceDone || isDone;

  const finish = async () => {
    await markComplete(lesson.id);
    if (next) navigate(`/app/lesson/${next.id}`);
    else navigate(`/app/track/${lesson.trackId}`);
  };

  return (
    <div className="content">
      <Link to={`/app/track/${lesson.trackId}`} className="muted" style={{ fontSize: 13 }}>
        ← {lesson.trackTitle}
      </Link>

      <div className="row between wrap mt-1">
        <span className={`pill pill-${lesson.level}`}>{lesson.level} · {lesson.minutes} min</span>
        {isDone && <span className="pill pill-easy">✓ completed</span>}
      </div>

      <div className="prose mt-2" dangerouslySetInnerHTML={{ __html: lesson.body }} />

      {lesson.practice && (
        <Practice practice={lesson.practice} onComplete={() => setPracticeDone(true)} />
      )}

      <div className="row between wrap mt-4" style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
        <Link to={`/app/track/${lesson.trackId}`} className="btn btn-ghost">← Back to track</Link>
        <div className="row">
          {lesson.practice && !canComplete && (
            <span className="muted" style={{ fontSize: 13 }}>Run the practice to continue →</span>
          )}
          <button className="btn btn-primary" onClick={finish} disabled={!canComplete}>
            {next ? "Complete & next →" : "Complete track ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
