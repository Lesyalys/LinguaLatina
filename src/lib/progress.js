/**
 * Новая структура progress:
 * {
 *   lastActive: "YYYY-MM-DD",
 *   history: [{ date, words, quizAnswers, total }],
 *   courses: {
 *     "course-1": {
 *       semesters: {
 *         "semester-1": {
 *           subjects: {
 *             "latin": { type, wordsLearned, attempts, lastActive },
 *             "anatomy": { type, quizLearned, attempts, lastActive }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 */

// ============================================================
// Обновить прогресс по предмету
// ============================================================
export const updateSubjectProgress = (
  progress,
  courseId,
  semesterId,
  subjectId,
  updates,
) => {
  const newProgress = JSON.parse(JSON.stringify(progress || {}));
  newProgress.courses = newProgress.courses || {};

  const course = newProgress.courses[courseId] || { semesters: {} };
  course.semesters = course.semesters || {};

  const semester = course.semesters[semesterId] || { subjects: {} };
  semester.subjects = semester.subjects || {};

  const subject = semester.subjects[subjectId] || {};
  semester.subjects[subjectId] = { ...subject, ...updates };

  course.semesters[semesterId] = semester;
  newProgress.courses[courseId] = course;

  return newProgress;
};

// ============================================================
// Прочитать прогресс по предмету
// ============================================================
export const getSubjectProgress = (
  progress,
  courseId,
  semesterId,
  subjectId,
) => {
  return (
    progress?.courses?.[courseId]?.semesters?.[semesterId]?.subjects?.[
      subjectId
    ] || null
  );
};

// ============================================================
// Обновить историю активности за сегодня
// ============================================================
export const updateHistory = (progress, today, delta) => {
  // delta: { words?: number, quizAnswers?: number }
  const newProgress = JSON.parse(JSON.stringify(progress || {}));
  const history = [...(newProgress.history || [])];
  const todayEntry = history.find((h) => h.date === today);

  if (todayEntry) {
    if (delta.words !== undefined) todayEntry.words = delta.words;
    if (delta.quizAnswers !== undefined)
      todayEntry.quizAnswers = delta.quizAnswers;
    todayEntry.total = (todayEntry.words || 0) + (todayEntry.quizAnswers || 0);
  } else {
    history.push({
      date: today,
      words: delta.words || 0,
      quizAnswers: delta.quizAnswers || 0,
      total: (delta.words || 0) + (delta.quizAnswers || 0),
    });
  }

  newProgress.history = history.slice(-365); // год
  newProgress.lastActive = today;

  return newProgress;
};

// ============================================================
// Сегодняшняя дата в формате YYYY-MM-DD
// ============================================================
export const todayISO = () => new Date().toISOString().split("T")[0];

// ============================================================
// Зафиксировать результаты тренировки по латыни
// ============================================================
// Принимает слова, отмеченные как «Знал» в этой сессии, объединяет их с уже
// выученными (уникально) и возвращает новый объект progress целиком.
// Компоненту остаётся только отдать его в updateProfile.
export const commitTrainingProgress = (
  oldProgress,
  { courseId, semesterId, subjectId = "latin", words },
) => {
  const today = todayISO();
  const base = oldProgress || {};

  const old = getSubjectProgress(base, courseId, semesterId, subjectId) || {
    wordsLearned: [],
    attempts: 0,
  };

  const uniqueWords = Array.from(
    new Set([...(old.wordsLearned || []), ...words.map((w) => w.text)]),
  );

  let next = updateSubjectProgress(base, courseId, semesterId, subjectId, {
    type: "subject",
    wordsLearned: uniqueWords,
    attempts: (old.attempts || 0) + 1,
    lastActive: today,
  });

  next = updateHistory(next, today, { words: uniqueWords.length });

  return next;
};

// ============================================================
// Зафиксировать результаты теста (экзамен)
// ============================================================
export const commitQuizProgress = (
  oldProgress,
  { courseId, semesterId, subjectId = "anatomy", cardIds },
) => {
  const today = todayISO();
  const base = oldProgress || {};

  const old = getSubjectProgress(base, courseId, semesterId, subjectId) || {
    quizLearned: [],
    attempts: 0,
  };

  const uniqueCards = Array.from(
    new Set([...(old.quizLearned || []), ...cardIds]),
  );

  let next = updateSubjectProgress(base, courseId, semesterId, subjectId, {
    type: "exam",
    quizLearned: uniqueCards,
    attempts: (old.attempts || 0) + 1,
    lastActive: today,
  });

  next = updateHistory(next, today, { quizAnswers: uniqueCards.length });

  return next;
};
