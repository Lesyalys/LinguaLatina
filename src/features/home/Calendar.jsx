import { useState, useMemo } from "react";
import { getWeekType, WEEK_DAYS_SHORT } from "../../lib/schedule";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  // Тип недели для текущей даты — начальное значение
  const initialWeekType = useMemo(
    () => getWeekType(currentDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [selectedWeekType, setSelectedWeekType] = useState(initialWeekType);

  const isEven = selectedWeekType === "Знаменатель";

  // Все дни месяца + для каждого — флаг «относится к выбранному типу»
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days = [];

    // Пустые ячейки до начала месяца
    for (let i = 0; i < startDay; i++) {
      days.push({ date: null, matches: false });
    }

    // Дни месяца
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dayType = getWeekType(date);
      days.push({
        date,
        matches: dayType === selectedWeekType,
      });
    }

    return days;
  }, [currentDate, selectedWeekType]);

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
      {/* 🔀 Переключатель типа недели */}
      <div className="week-type-bar">
        <button
          type="button"
          className={`week-type-item ${!isEven ? "active" : ""}`}
          onClick={() => setSelectedWeekType("Числитель")}
        >
          Числитель
        </button>
        <div className="week-type-divider">/</div>
        <button
          type="button"
          className={`week-type-item ${isEven ? "active" : ""}`}
          onClick={() => setSelectedWeekType("Знаменатель")}
        >
          Знаменатель
        </button>
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
        {calendarData.map(({ date, matches }, idx) => (
          <div
            key={idx}
            className={[
              "calendar-day",
              !date ? "empty" : "",
              isToday(date) ? "today" : "",
              matches ? "week-match" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {date ? date.getDate() : ""}
          </div>
        ))}
      </div>

      <div className="calendar-footer">Неделя • {selectedWeekType}</div>
    </div>
  );
};

export default Calendar;
