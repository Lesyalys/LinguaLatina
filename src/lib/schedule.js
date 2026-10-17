import scheduleData from "../data/schedule/simestr_1/schedule.json";

// ISO-номер недели (1..53)
export const getWeekNumber = (date = new Date()) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

// Возвращает "Числитель" или "Знаменатель" по дате
export const getWeekType = (date = new Date()) => {
  return getWeekNumber(date) % 2 === 0 ? "Знаменатель" : "Числитель";
};

// Индекс дня в неделе (0 = Пн)
export const getDayIndex = (date = new Date()) => {
  const d = date.getDay(); // 0 = Вс
  return d === 0 ? 6 : d - 1;
};

// Все дни недели
export const WEEK_DAYS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

export const WEEK_DAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

// Расписание на конкретный день и неделю
export const getScheduleForDay = (weekType, dayIndex, group = "A") => {
  const week = scheduleData.data.find((w) => w.week_type === weekType);
  if (!week) return { bells: scheduleData.bells, lessons: [] };

  const day = week.days[dayIndex];
  if (!day) return { bells: scheduleData.bells, lessons: [] };

  return {
    bells: scheduleData.bells,
    lessons: day.lessons.map((l) => ({
      bell: scheduleData.bells.find((b) => b.id === l.bell_id),
      subject: group === "A" ? l.group_A : l.group_B,
    })),
  };
};

export { scheduleData };
