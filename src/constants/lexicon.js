import lexicon from "../data/lexicon.json";

// Имена лексических минимумов в данных (в JSON исторически опечатка: группы "lexs_min_N").
export const LEXMIN_IDS = ["lexs_min_1", "lexs_min_2", "lexs_min_3"];

// Человекочитаемое имя группы: "lexs_min_2" -> "Лексический минимум 2"
export function formatGroupName(name) {
  return name.replace("lexs_min_", "Лексический минимум ");
}

// Короткая версия для карточек тренировки: "Минимум 2"
export function formatGroupShortName(name) {
  return name.replace("lexs_min_", "Минимум ");
}

// Словарь в удобном для компонентов виде (единая точка входа на весь json).
export const lexminGroups = lexicon.data.map((group) => ({
  id: group.name,
  title: formatGroupName(group.name),
  words: group.words ?? [],
}));

// Все слова одним списком (каждое с id группы) — используется в тренировке.
export const allWords = lexminGroups.flatMap((group) =>
  group.words.map((word) => ({ ...word, groupId: group.id })),
);
