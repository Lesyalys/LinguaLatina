const STORAGE_KEY_GROUP = "user-group-preference";
const STORAGE_KEY_SCHEDULE_GROUP = "user-schedule-group";

export const getResolvedGroup = (profile) => {
  if (typeof window === "undefined") return "A";
  const local = localStorage.getItem(STORAGE_KEY_GROUP);
  if (local === "A" || local === "B") return local;
  if (profile?.group === "A" || profile?.group === "B") return profile.group;
  return "A";
};

/**
 * Приоритет:
 * 1. localStorage (пользователь выбрал на этом устройстве)
 * 2. profile.scheduleGroup (пришёл с другого устройства)
 * 3. Первая доступная группа
 */
export const getResolvedScheduleGroup = (profile, availableGroups = []) => {
  if (typeof window === "undefined") {
    return profile?.scheduleGroup || availableGroups[0] || null;
  }

  // 🎯 localStorage — приоритет
  const local = localStorage.getItem(STORAGE_KEY_SCHEDULE_GROUP);
  if (local && availableGroups.includes(local)) {
    return local;
  }

  // profile.scheduleGroup
  if (
    profile?.scheduleGroup &&
    availableGroups.includes(profile.scheduleGroup)
  ) {
    return profile.scheduleGroup;
  }

  // Первая доступная
  return availableGroups[0] || null;
};

export const saveScheduleGroupLocal = (group) => {
  if (typeof window === "undefined") return;
  if (!group) return;
  localStorage.setItem(STORAGE_KEY_SCHEDULE_GROUP, group);
};

export const getLocalScheduleGroup = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY_SCHEDULE_GROUP);
};

export const clearLocalScheduleGroup = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY_SCHEDULE_GROUP);
  }
};
