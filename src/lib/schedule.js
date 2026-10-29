import { loadMaterialData } from "./materials";
// ============================================================
// Доступные группы (из массива)
// ============================================================
export const getScheduleGroups = (scheduleArray) => {
  if (!Array.isArray(scheduleArray)) return [];
  return scheduleArray.map((s) => s.group).filter(Boolean);
};
export const getScheduleByGroup = (scheduleArray, group) => {
  if (!Array.isArray(scheduleArray) || !scheduleArray.length) return null;
  return scheduleArray.find((s) => s.group === group) || scheduleArray[0];
};

// ============================================================
// Обогащение группы (course, season, hasGroups)
// ============================================================
const detectHasGroups = (scheduleItem) => {
  if (typeof scheduleItem.hasGroups === "boolean") {
    return scheduleItem.hasGroups;
  }
  for (const week of scheduleItem.data || []) {
    for (const day of week.days || []) {
      for (const lesson of day.lessons || []) {
        if (lesson.group_B?.subject) return true;
      }
    }
  }
  return false;
};

export const enrichScheduleItem = (item) => ({
  ...item,
  course: item.course ?? 1,
  season: item.season ?? "Осень",
  hasGroups: detectHasGroups(item),
});

export const getEnrichedScheduleArray = (scheduleArray) => {
  if (!Array.isArray(scheduleArray)) return [];
  return scheduleArray.map(enrichScheduleItem);
};
// ============================================================
// Доступные сезоны
// ============================================================
export const getAvailableSeasons = (scheduleArray) => {
  const enriched = getEnrichedScheduleArray(scheduleArray);
  const set = new Set();
  enriched.forEach((s) => {
    if (s.season) set.add(s.season);
  });
  const order = ["Осень", "Зима", "Весна", "Лето"];
  return Array.from(set).sort((a, b) => order.indexOf(a) - order.indexOf(b));
};

// ============================================================
// Загрузка расписания (S3 / schedule/schedule.json)
// ============================================================
const SCHEDULE_PATH = "schedule/schedule.json";

export const loadScheduleData = async () => {
  return loadMaterialData(SCHEDULE_PATH); // см. materials.js
};

// ============================================================
// ISO-номер недели / Тип недели / День недели
// ============================================================
const getMonday = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

export const getWeekType = (date = new Date()) => {
  const acYear =
    date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1;

  const sep1 = new Date(acYear, 8, 1);
  const firstMonday = getMonday(sep1);
  const curMonday = getMonday(date);

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
// Расписание на день
// ============================================================
export const getScheduleForDay = (
  scheduleData,
  weekType,
  dayIndex,
  group = "A",
) => {
  if (!scheduleData) return { bells: [], lessons: [] };

  const week = scheduleData.data?.find((w) => w.week_type === weekType);
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

// ============================================================
// Следующая пара
// ============================================================
const parseTimeRange = (timeStr) => {
  if (!timeStr) return null;
  const [start, end] = timeStr.split("-").map((s) => s.trim());
  if (!start || !end) return null;

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null;

  return { startMin: sh * 60 + sm, endMin: eh * 60 + em };
};

export const getNextLesson = (
  scheduleData,
  weekType,
  dayIndex,
  group = "A",
  now = new Date(),
) => {
  if (!scheduleData) return null;
  if (dayIndex < 0 || dayIndex > 5) return null;

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

  return null;
};
