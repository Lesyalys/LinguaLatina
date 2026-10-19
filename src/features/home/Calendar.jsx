import React, { useState, useMemo } from "react";
import { getWeekType, WEEK_DAYS_SHORT } from "../../lib/schedule";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  // ✅ getWeekType теперь возвращает "Числитель" | "Знаменатель"
  const weekType = useMemo(() => getWeekType(currentDate), [currentDate]);
  const isEvenWeek = weekType === "Знаменатель";

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  const weekDays = WEEK_DAYS_SHORT.concat("Вс");

  const isToday = (date) => {
    if (!date) return false;
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  return (
    <div className="card calendar-card">
      <div className="week-type-bar">
        <div className={`week-type-item ${!isEvenWeek ? "active" : ""}`}>
          Числитель
        </div>
        <div className="week-type-divider">/</div>
        <div className={`week-type-item ${isEvenWeek ? "active" : ""}`}>
          Знаменатель
        </div>
      </div>

      <div className="calendar-header">
        <button onClick={() => changeMonth(-1)} className="calendar-nav-btn">
          ←
        </button>
        <h3>{monthName}</h3>
        <button onClick={() => changeMonth(1)} className="calendar-nav-btn">
          →
        </button>
      </div>

      <div className="calendar-grid">
        {weekDays.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        {calendarData.map((date, idx) => (
          <div
            key={idx}
            className={`calendar-day ${!date ? "empty" : ""} ${
              isToday(date) ? "today" : ""
            }`}
          >
            {date ? date.getDate() : ""}
          </div>
        ))}
      </div>

      <div className="calendar-footer">Неделя • {weekType}</div>
    </div>
  );
};

export default Calendar;
