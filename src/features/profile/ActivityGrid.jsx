import { useMemo } from "react";

const DAYS_IN_YEAR = 365;
const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const getLevel = (total) => {
  if (!total) return 0;
  if (total <= 2) return 1;
  if (total <= 5) return 2;
  if (total <= 10) return 3;
  return 4;
};

const LEVEL_CLASSES = [
  "activity-cell--l0",
  "activity-cell--l1",
  "activity-cell--l2",
  "activity-cell--l3",
  "activity-cell--l4",
];

// 🗓 Локальная дата в формате YYYY-MM-DD (без UTC-сдвига)
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const ActivityGrid = ({ history = [] }) => {
  // 🗓 map: { "YYYY-MM-DD": total }
  const activityMap = useMemo(() => {
    const map = {};
    history.forEach((h) => {
      const total = h.total ?? (h.words || 0) + (h.quizAnswers || 0);
      map[h.date] = total;
    });
    return map;
  }, [history]);

  // 📅 Массив дней за последний год
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setDate(start.getDate() - (DAYS_IN_YEAR - 1));

    // Сдвигаем на понедельник той недели
    const startDay = start.getDay() === 0 ? 6 : start.getDay() - 1;
    const gridStart = new Date(start);
    gridStart.setDate(gridStart.getDate() - startDay);

    const arr = [];
    const cur = new Date(gridStart);

    while (cur <= today) {
      const dateStr = formatDate(cur); // ← локальная дата
      const total = activityMap[dateStr] || 0;
      arr.push({
        date: dateStr,
        total,
        level: getLevel(total),
        isFuture: false,
      });
      cur.setDate(cur.getDate() + 1);
    }
    return arr;
  }, [activityMap]);

  // 📊 Группируем по неделям (7 дней в колонке)
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  // 🏷 Месяцы — по неделям
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (!firstDay) return;
      const date = new Date(firstDay.date + "T00:00:00");
      const month = date.getMonth();
      if (month !== lastMonth) {
        lastMonth = month;
        labels.push({
          weekIndex,
          label: date.toLocaleString("ru-RU", { month: "short" }),
        });
      }
    });
    return labels;
  }, [weeks]);

  // 📈 Всего за год
  const totalYear = useMemo(
    () => days.reduce((acc, d) => acc + d.total, 0),
    [days],
  );

  // 📏 Ширина недели (12px ячейка + 3px gap)
  const WEEK_WIDTH = 15;

  return (
    <div className="activity-grid">
      <div className="activity-grid__header">
        <h3>Активность</h3>
        <span className="activity-grid__total">{totalYear} за год</span>
      </div>

      <div className="activity-grid__container">
        {/* Дни недели */}
        <div className="activity-grid__days">
          {WEEK_DAYS.map((d, i) => (
            <div key={d} className="activity-grid__day-label">
              {i % 2 === 0 ? d : ""}
            </div>
          ))}
        </div>

        <div className="activity-grid__body">
          {/* Месяцы — абсолютное позиционирование по колонкам недель */}
          <div
            className="activity-grid__months"
            style={{ width: `${weeks.length * WEEK_WIDTH}px` }}
          >
            {monthLabels.map((m) => (
              <div
                key={`${m.weekIndex}-${m.label}`}
                className="activity-grid__month"
                style={{ left: `${m.weekIndex * WEEK_WIDTH}px` }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Сетка недель */}
          <div className="activity-grid__weeks">
            {weeks.map((week, wi) => (
              <div key={wi} className="activity-grid__week">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`activity-cell ${LEVEL_CLASSES[day.level]}`}
                    title={`${day.date}: ${day.total} активности`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Легенда */}
      <div className="activity-grid__legend">
        <span>Меньше</span>
        {LEVEL_CLASSES.map((cls, i) => (
          <div key={i} className={`activity-cell ${cls}`} />
        ))}
        <span>Больше</span>
      </div>
    </div>
  );
};

export default ActivityGrid;
