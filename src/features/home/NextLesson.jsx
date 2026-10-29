import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getResolvedGroup } from "../../lib/group";
import { getNextLesson } from "../../lib/schedule";

const NextLesson = ({ scheduleData, weekType, dayIndex, scheduleGroup }) => {
  const { user, profile } = useAuth();
  const group = getResolvedGroup(profile);

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const interval = setInterval(tick, 30 * 1000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const next = useMemo(
    () => getNextLesson(scheduleData, weekType, dayIndex, group, now),
    [scheduleData, weekType, dayIndex, group, now],
  );

  if (!user || !profile) return null;

  if (!next) {
    return (
      <div className="next-lesson next-lesson--empty">
        <div className="next-lesson__icon">🎉</div>
        <div className="next-lesson__body">
          <strong>Пар больше нет</strong>
          <p>Можно отдохнуть или повторить материал</p>
        </div>
      </div>
    );
  }

  const formatMinutes = (min) => {
    if (min < 60) return `${min} мин`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
  };

  const isNow = next.status === "now";

  return (
    <div className={`next-lesson ${isNow ? "next-lesson--now" : ""}`}>
      <div className="next-lesson__icon">{isNow ? "🔴" : "⏰"}</div>
      <div className="next-lesson__body">
        <div className="next-lesson__header">
          <span className="next-lesson__label">
            {isNow ? "Сейчас идёт" : "Следующая пара"}
          </span>
          <span className="next-lesson__num">№{next.bell.id}</span>
          <span className="next-lesson__group">
            {scheduleGroup ? `${scheduleGroup} · ` : ""}
            гр. {group}
          </span>
        </div>
        <strong className="next-lesson__subject">{next.subject}</strong>
        <div className="next-lesson__meta">
          {next.room && <span>📍 {next.room}</span>}
          <span>🕐 {next.time}</span>
        </div>
        <div className="next-lesson__timer">
          {isNow
            ? `до конца ${formatMinutes(next.minutesLeft)}`
            : `через ${formatMinutes(next.minutesUntil)}`}
        </div>
      </div>
    </div>
  );
};

export default NextLesson;
