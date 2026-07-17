import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TRACKS as BASE_TRACKS } from "../data/course.js";
import { api } from "../lib/api.js";

const CourseCtx = createContext(null);

// Merge admin-created (DB) lessons into the built-in track structure.
function mergeTracks(base, custom) {
  const tracks = base.map((t) => ({ ...t, lessons: [...t.lessons] }));
  const byId = Object.fromEntries(tracks.map((t) => [t.id, t]));

  for (const c of custom) {
    const track = byId[c.track_id];
    if (!track) continue;
    let practice = null;
    if (c.practice_json) {
      try { practice = JSON.parse(c.practice_json); } catch { practice = null; }
    }
    track.lessons.push({
      id: `c${c.id}`,          // route id for custom lessons
      dbId: c.id,
      custom: true,
      title: c.title,
      level: c.level || "easy",
      minutes: c.minutes || 8,
      body: c.body || "",
      practice,
      order: c.order ?? 100,
    });
  }
  // keep custom lessons after built-ins, sorted by their order
  for (const t of tracks) {
    t.lessons.sort((a, b) => (a.custom ? 1 : 0) - (b.custom ? 1 : 0) || (a.order ?? 0) - (b.order ?? 0));
  }
  return tracks;
}

export function CourseProvider({ children }) {
  const [custom, setCustom] = useState([]);

  const reload = useCallback(async () => {
    try {
      setCustom(await api.getCustomLessons());
    } catch {
      setCustom([]);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const value = useMemo(() => {
    const tracks = mergeTracks(BASE_TRACKS, custom);
    const allLessons = tracks.flatMap((t) =>
      t.lessons.map((l) => ({ ...l, trackId: t.id, trackTitle: t.title, trackIcon: t.icon }))
    );
    return {
      tracks,
      allLessons,
      totalLessons: allLessons.length,
      getTrack: (id) => tracks.find((t) => t.id === id),
      getLesson: (id) => allLessons.find((l) => l.id === id),
      nextLesson: (id) => {
        const i = allLessons.findIndex((l) => l.id === id);
        return i >= 0 && i < allLessons.length - 1 ? allLessons[i + 1] : null;
      },
      reload,
    };
  }, [custom, reload]);

  return <CourseCtx.Provider value={value}>{children}</CourseCtx.Provider>;
}

export const useCourse = () => useContext(CourseCtx);
