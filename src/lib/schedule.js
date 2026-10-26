// ============================================================
// Утилиты для работы с неделями и днями
// ============================================================

// Понедельник календарной недели, содержащей дату
const getMonday = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay() || 7; // 1..7, вс = 7
  d.setDate(d.getDate() - (day - 1));
  return d;
};

/**
 * Парсит строку вида "10:00-11:20" → { startMin, endMin }
 * (минуты от начала суток)
 */
const parseTimeRange = (timeStr) => {
  if (!timeStr) return null;
  const [start, end] = timeStr.split("-").map((s) => s.trim());
  if (!start || !end) return null;

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null;

  return {
    startMin: sh * 60 + sm,
    endMin: eh * 60 + em,
  };
};

/**
 * Возвращает следующую пару на сегодня.
 *
 * @param {Object} scheduleData — данные расписания (JSON из S3)
 * @param {string} weekType — "Числитель" | "Знаменатель"
 * @param {number} dayIndex — 0..5 (0 = Пн)
 * @param {string} group — "A" | "B"
 * @param {Date} now — текущее время (по умолчанию new Date())
 * @returns {null | { bell, subject, room, time, status: "now" | "next", minutesLeft, minutesUntil }}
 */
export const getNextLesson = (
  scheduleData,
  weekType,
  dayIndex,
  group = "A",
  now = new Date(),
) => {
  if (!scheduleData) return null;
  if (dayIndex < 0 || dayIndex > 5) return null; // воскресенье

  const week = scheduleData.data?.find((w) => w.week_type === weekType);
  if (!week) return null;

  const day = week.days?.[dayIndex];
  if (!day) return null;

  const groupKey = group === "A" ? "group_A" : "group_B";
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const lessons = (day.lessons || [])
    .map((l) => {
      const bell = scheduleData.bells?.find((b) => b.id === l.bell_id);
      const info = l[groupKey];
      if (!bell || !info?.subject) return null;

      const range = parseTimeRange(bell.time);
      if (!range) return null;

      return {
        bell,
        subject: info.subject,
        room: info.room,
        time: bell.time,
        ...range,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.startMin - b.startMin);

  // 1. Пара идёт сейчас
  const current = lessons.find(
    (l) => nowMin >= l.startMin && nowMin <= l.endMin,
  );
  if (current) {
    return {
      bell: current.bell,
      subject: current.subject,
      room: current.room,
      time: current.time,
      status: "now",
      minutesLeft: current.endMin - nowMin,
      minutesUntil: 0,
    };
  }

  // 2. Ближайшая будущая пара
  const next = lessons.find((l) => l.startMin > nowMin);
  if (next) {
    return {
      bell: next.bell,
      subject: next.subject,
      room: next.room,
      time: next.time,
      status: "next",
      minutesLeft: 0,
      minutesUntil: next.startMin - nowMin,
    };
  }

  // 3. Пар больше нет
  return null;
};

export const getWeekType = (date = new Date()) => {
  // учебный год начинается 1 сентября; в янв–авг — в прошлом году
  const acYear =
    date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1;
  const sep1 = new Date(acYear, 8, 1); // 1 сентября, локально

  // понедельник недели, в которую попало 1 сентября
  const firstMonday = getMonday(sep1);

  // понедельник недели текущей даты
  const curMonday = getMonday(date);

  // номер учебной недели, начиная с 1 (неделя, содержащая 1 сентября)
  const weekIndex = Math.round((curMonday - firstMonday) / (7 * 86400000));
  const weekNumber = weekIndex + 1;

  return weekNumber % 2 === 1 ? "Числитель" : "Знаменатель";
};

export const getDayIndex = (date = new Date()) => {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
};

export const WEEK_DAYS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

export const WEEK_DAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

// ============================================================
// Извлечь расписание на день из данных
// ============================================================
export const getScheduleForDay = (
  scheduleData,
  weekType,
  dayIndex,
  group = "A",
) => {
  if (!scheduleData) return { bells: [], lessons: [] };

  const week = scheduleData.data.find((w) => w.week_type === weekType);
  if (!week) return { bells: scheduleData.bells || [], lessons: [] };

  const day = week.days[dayIndex];
  if (!day) return { bells: scheduleData.bells || [], lessons: [] };

  const groupKey = group === "A" ? "group_A" : "group_B";

  return {
    bells: scheduleData.bells || [],
    lessons: day.lessons.map((l) => ({
      bell: scheduleData.bells.find((b) => b.id === l.bell_id),
      subject: l[groupKey]?.subject || "",
      room: l[groupKey]?.room || null,
    })),
  };
};
