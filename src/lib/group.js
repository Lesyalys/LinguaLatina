const STORAGE_KEY = "user-group-preference";

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

export const STORAGE_KEY_GROUP = STORAGE_KEY;
