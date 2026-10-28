import React, { useState, useMemo, useEffect } from "react";
import DataWarning from "../../components/ui/DataWarning";
import {
  getWeekType,
  getDayIndex,
  getScheduleForDay,
  WEEK_DAYS_SHORT,
  WEEK_DAYS,
} from "../../lib/schedule";

const ScheduleCard = ({
  data: scheduleData,
  loading,
  source,
  viewGroup,
  onViewGroupChange,
  profileGroup,
}) => {
  const today = useMemo(() => new Date(), []);
  const todayIndex = useMemo(() => getDayIndex(today), [today]);

  const [selectedDay, setSelectedDay] = useState(
    todayIndex >= 0 && todayIndex < 6 ? todayIndex : 0,
  );
  const [weekType, setWeekType] = useState(null);

  useEffect(() => {
    if (scheduleData) {
      setWeekType(getWeekType(today, scheduleData));
    }
  }, [scheduleData, today]);

  const currentWeekType = useMemo(
    () => (scheduleData ? getWeekType(today, scheduleData) : null),
    [today, scheduleData],
  );

  const isCurrentWeek = weekType === currentWeekType;
  const isCurrentDay =
    isCurrentWeek && selectedDay === todayIndex && todayIndex < 6;

  const { bells, lessons } = useMemo(
    () => getScheduleForDay(scheduleData, weekType, selectedDay, viewGroup),
    [scheduleData, weekType, selectedDay, viewGroup],
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

  const isViewingOtherGroup = viewGroup !== profileGroup;

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
          >
            Знаменатель
            {currentWeekType === "Знаменатель" && (
              <span className="current-dot" />
            )}
          </button>
        </div>
      </div>

      <DataWarning source={source} />

      <div className="schedule-group-switch">
        <button
          className={`group-btn ${viewGroup === "A" ? "active" : ""}`}
          onClick={() => onViewGroupChange("A")}
          title="Только просмотр — не меняет вашу группу в профиле"
        >
          Группа A
        </button>
        <button
          className={`group-btn ${viewGroup === "B" ? "active" : ""}`}
          onClick={() => onViewGroupChange("B")}
          title="Только просмотр — не меняет вашу группу в профиле"
        >
          Группа B
        </button>
      </div>

      {isViewingOtherGroup && (
        <div className="schedule-view-note">
          👀 Вы смотрите <strong>группу {viewGroup}</strong>. Ваша группа в
          профиле — <strong>{profileGroup}</strong>.
          <button
            type="button"
            className="schedule-view-reset"
            onClick={() => onViewGroupChange(profileGroup)}
          >
            ← К моей группе
          </button>
        </div>
      )}

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
