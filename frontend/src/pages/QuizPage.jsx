import { Link, useParams } from "react-router-dom";
import Quiz from "../components/Quiz.jsx";
import { QUIZZES } from "../data/quizzes.js";
import { useCourse } from "../context/CourseContext.jsx";
import { useProgress } from "../lib/useProgress.js";

export default function QuizPage() {
  const { trackId } = useParams();
  const { getTrack } = useCourse();
  const { completed, markComplete } = useProgress();
  const track = getTrack(trackId);
  const questions = QUIZZES[trackId];

  if (!questions) return <div className="content">Quiz not found.</div>;

  const passedBefore = completed.has(`quiz-${trackId}`);

  return (
    <div className="content" style={{ maxWidth: 760 }}>
      <Link to={`/app/track/${trackId}`} className="muted" style={{ fontSize: 13 }}>← {track?.title}</Link>
      <div className="row between wrap mt-1">
        <h1 style={{ margin: 0 }}>🧠 {track?.title} quiz</h1>
        {passedBefore && <span className="pill pill-easy">✓ passed</span>}
      </div>
      <p>Test what you learned. You need 60% to pass — you can retry as many times as you like.</p>

      <div className="mt-2">
        <Quiz questions={questions} onPass={() => markComplete(`quiz-${trackId}`)} />
      </div>
    </div>
  );
}
