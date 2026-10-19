// Чистые утилиты без состояния — то, что можно покрыть юнит-тестами.

/**
 * Нормализация строки для поиска: нижний регистр + замена ё -> е.
 * Теперь «йцо» найдёт «ovum», а «еж» — «ёж».
 */
export function normalize(str) {
  return str.toLowerCase().replace(/ё/g, "е").trim();
}

/**
 * Беспристрастное перемешивание (алгоритм Фишера–Йетса).
 * Заменяет антипаттерн `[...arr].sort(() => Math.random() - 0.5)`,
 * который даёт смещённый результат и нарушает чистоту рендера
 * (на него жалуется eslint-plugin-react-hooks: react-hooks/purity).
 */
export function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
