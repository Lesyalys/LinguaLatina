// src/lib/profileUtils.js

/**
 * Суммирует все слова из новой вложенной структуры progress.courses[].semesters[].subjects[].wordsLearned
 * + поддерживает старый плоский формат progress.wordsLearned для обратной совместимости.
 */
export const countWordsLearned = (progress) => {
  if (!progress) return 0;

  // Старый плоский формат (массив или число)
  const flat = progress.wordsLearned;
  if (Array.isArray(flat)) return flat.length;
  if (typeof flat === "number") return flat;

  // Новая вложенная структура: courses → semesters → subjects → wordsLearned (Set/Array)
  let total = 0;
  const courses = progress.courses || {};
  for (const cId of Object.keys(courses)) {
    const semesters = courses[cId]?.semesters || {};
    for (const sId of Object.keys(semesters)) {
      const subjects = semesters[sId]?.subjects || {};
      for (const subId of Object.keys(subjects)) {
        const wl = subjects[subId]?.wordsLearned;
        if (Array.isArray(wl)) total += wl.length;
        else if (typeof wl === "number") total += wl;
      }
    }
  }
  return total;
};

export const getInitials = (profile) => {
  const name = profile?.display_name || profile?.username || "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const formatMemberSince = (createdAt) => {
  if (!createdAt) return "";
  return new Date(createdAt).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
  });
};

export const calcExpPercent = (wordsLearned = 0) => {
  const target = 1000;
  return Math.min(100, Math.round((wordsLearned / target) * 100));
};
