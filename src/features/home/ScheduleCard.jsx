import React, { useState, useMemo, useEffect } from "react";
import { loadMaterialData } from "../../lib/materials";

import {
  getWeekType,
  getDayIndex,
  getScheduleForDay,
  WEEK_DAYS_SHORT,
  WEEK_DAYS,
} from "../../lib/schedule";
const SCHEDULE_FILE = "courses/course-1/semester-1/schedule/schedule.json";

const ScheduleCard = () => {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const todayIndex = useMemo(() => getDayIndex(today), [today]);
  const currentWeekType = useMemo(() => getWeekType(today), [today]);

  const [selectedDay, setSelectedDay] = useState(
    todayIndex >= 0 && todayIndex < 6 ? todayIndex : 0,
  );
  const [weekType, setWeekType] = useState(currentWeekType);
  const [group, setGroup] = useState("A");

  useEffect(() => {
    loadMaterialData(SCHEDULE_FILE).then((data) => {
      setScheduleData(data);
      setLoading(false);
    });
  }, []);

  const isCurrentWeek = weekType === currentWeekType;
  const isCurrentDay =
    isCurrentWeek && selectedDay === todayIndex && todayIndex < 6;

  const { bells, lessons } = useMemo(
    () => getScheduleForDay(scheduleData, weekType, selectedDay, group),
    [scheduleData, weekType, selectedDay, group],
  );

  if (loading) {
    return (
      <div className="card schedule-card">
        <div className="schedule-header">
          <h3>Расписание</h3>
        </div>
        <div className="schedule-empty">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="card schedule-card">
      {/* Заголовок с переключением */}
      <div className="schedule-header">
        <h3>Расписание</h3>

        <div className="schedule-week-switch">
          <button
            className={`week-toggle-btn ${
              weekType === "Числитель" ? "active" : ""
            } ${currentWeekType === "Числитель" ? "current" : ""}`}
            onClick={() => setWeekType("Числитель")}
            title={
              currentWeekType === "Числитель"
                ? "Текущая неделя — числитель"
                : "Показать числитель"
            }
          >
            Числитель
            {currentWeekType === "Числитель" && (
              <span className="current-dot" />
            )}
          </button>
          <span className="week-divider">/</span>
          <button
            className={`week-toggle-btn ${
              weekType === "Знаменатель" ? "active" : ""
            } ${currentWeekType === "Знаменатель" ? "current" : ""}`}
            onClick={() => setWeekType("Знаменатель")}
            title={
              currentWeekType === "Знаменатель"
                ? "Текущая неделя — знаменатель"
                : "Показать знаменатель"
            }
          >
            Знаменатель
            {currentWeekType === "Знаменатель" && (
              <span className="current-dot" />
            )}
          </button>
        </div>
      </div>

      {/* Переключатель групп */}
      <div className="schedule-group-switch">
        <button
          className={`group-btn ${group === "A" ? "active" : ""}`}
          onClick={() => setGroup("A")}
        >
          Группа A
        </button>
        <button
          className={`group-btn ${group === "B" ? "active" : ""}`}
          onClick={() => setGroup("B")}
        >
          Группа B
        </button>
      </div>

      {/* Дни */}
      <div className="schedule-days">
        {WEEK_DAYS_SHORT.map((short, idx) => (
          <button
            key={short}
            className={`day-btn ${selectedDay === idx ? "active" : ""} ${
              isCurrentWeek && todayIndex === idx ? "today" : ""
            }`}
            onClick={() => setSelectedDay(idx)}
            title={WEEK_DAYS[idx]}
          >
            {short}
          </button>
        ))}
      </div>

      {/* Заголовок дня */}
      <div className="schedule-day-title">
        {WEEK_DAYS[selectedDay]}
        <span
          className={`week-type-badge ${weekType === "Числитель" ? "chisl" : "znam"}`}
        >
          {weekType}
        </span>
        {isCurrentDay && <span className="today-badge">Сегодня</span>}
      </div>

      {/* Пары */}
      <div className="schedule-lessons">
        {lessons.length === 0 || lessons.every((l) => !l.subject) ? (
          <div className="schedule-empty">Нет занятий</div>
        ) : (
          lessons.map((l) => {
            if (!l.subject) return null;
            const [subjectRaw, room] = l.subject
              .split(",")
              .map((s) => s.trim());
            return (
              <div key={l.bell.id} className="schedule-lesson">
                <div className="lesson-time">
                  <strong>{l.bell.id}.</strong>
                  <span>{l.bell.time}</span>
                </div>
                <div className="lesson-info">
                  <div className="lesson-subject">{subjectRaw}</div>
                  {room && <div className="lesson-room">📍 {room}</div>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ScheduleCard;
