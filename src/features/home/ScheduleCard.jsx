import React, { useState, useMemo, useEffect } from "react";
import { loadMaterialData } from "../../lib/materials";
import {
  getWeekType,
  getDayIndex,
  getScheduleForDay,
  WEEK_DAYS_SHORT,
  WEEK_DAYS,
} from "../../lib/schedule";

const SCHEDULE_FILE = "courses/course-1/semester-1/schedule/schedule_v2.json";

const ScheduleCard = () => {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const todayIndex = useMemo(() => getDayIndex(today), [today]);

  const [selectedDay, setSelectedDay] = useState(
    todayIndex >= 0 && todayIndex < 6 ? todayIndex : 0,
  );
  const [weekType, setWeekType] = useState(null);
  const [group, setGroup] = useState("A");

  // Загрузка + автоподстановка типа недели
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadMaterialData(SCHEDULE_FILE).then((data) => {
      if (cancelled) return;
      setScheduleData(data);
      setWeekType(getWeekType(today, data));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [today]);

  const currentWeekType = useMemo(
    () => (scheduleData ? getWeekType(today, scheduleData) : null),
    [today, scheduleData],
  );

  const isCurrentWeek = weekType === currentWeekType;
  const isCurrentDay =
    isCurrentWeek && selectedDay === todayIndex && todayIndex < 6;

  const { bells, lessons } = useMemo(
    () => getScheduleForDay(scheduleData, weekType, selectedDay, group),
    [scheduleData, weekType, selectedDay, group],
  );

  if (loading || !weekType) {
    return (
      <div className="card schedule-card">
        <div className="schedule-header">
          <h3>Расписание</h3>
        </div>
        <div className="schedule-empty">Загрузка...</div>
      </div>
    );
  }

  // Все пары (по bells), даже если lessons нет — оставляем пустыми
  const rows = bells.map((bell) => {
    const lesson = lessons.find((l) => l.bell?.id === bell.id);
    const subject = lesson?.subject || "";
    const room = lesson?.room || "";

    return {
      bellId: bell.id,
      time: bell.time,
      subject,
      room,
      isEmpty: !subject,
    };
  });

  return (
    <div className="card schedule-card">
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

      <div className="schedule-day-title">
        {WEEK_DAYS[selectedDay]}
        <span
          className={`week-type-badge ${
            weekType === "Числитель" ? "chisl" : "znam"
          }`}
        >
          {weekType}
        </span>
        {isCurrentDay && <span className="today-badge">Сегодня</span>}
      </div>

      {/* 📊 Таблица пар */}
      <table className="schedule-table">
        <thead>
          <tr>
            <th className="schedule-th-num">№</th>
            <th className="schedule-th-subject">Пара</th>
            <th className="schedule-th-room">Место</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.bellId}
              className={row.isEmpty ? "schedule-row-empty" : ""}
            >
              <td className="schedule-td-num">
                <div className="schedule-bell-num">{row.bellId}</div>
                <div className="schedule-bell-time">{row.time}</div>
              </td>
              <td className="schedule-td-subject">
                {row.subject || <span className="schedule-dash">—</span>}
              </td>
              <td className="schedule-td-room">
                {row.room || <span className="schedule-dash">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleCard;
