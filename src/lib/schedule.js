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
