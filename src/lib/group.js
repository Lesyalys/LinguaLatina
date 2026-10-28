const STORAGE_KEY = "user-group-preference";

/**
 * Ключ localStorage, в котором хранится выбранная подгруппа.
 * Единый источник правды — его используют и getResolvedGroup, и useGroupPreference.
 */
export const GROUP_STORAGE_KEY = STORAGE_KEY;

/**
 * Актуальная группа пользователя:
 * 1. localStorage (мгновенно, последнее изменение)
 * 2. profile.group (из БД — может быть устаревшим на 1 рендер)
 * 3. "A"
 */
export const getResolvedGroup = (profile) => {
  if (typeof window === "undefined") return "A";

  const localGroup = localStorage.getItem(STORAGE_KEY);
  if (localGroup === "A" || localGroup === "B") return localGroup;

  if (profile?.group === "A" || profile?.group === "B") {
    return profile.group;
  }

  return "A";
};
