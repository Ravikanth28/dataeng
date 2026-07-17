import { useCallback, useEffect, useState } from "react";
import { api } from "./api.js";

// Loads the current user's completed-lesson set and exposes a marker.
export function useProgress() {
  const [completed, setCompleted] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const rows = await api.getProgress();
      setCompleted(new Set(rows.filter((r) => r.status === "completed").map((r) => r.lesson_id)));
    } catch {
      setCompleted(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const markComplete = useCallback(async (lessonId) => {
    await api.saveProgress(lessonId, "completed", 100);
    setCompleted((prev) => new Set(prev).add(lessonId));
  }, []);

  return { completed, loading, reload, markComplete };
}
