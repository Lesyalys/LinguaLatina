import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useScheduleContext } from "../context/ScheduleContext";
import {
  getResolvedScheduleGroup,
  saveScheduleGroupLocal,
  getLocalScheduleGroup,
} from "../lib/group";
import { getScheduleGroups, getEnrichedScheduleArray } from "../lib/schedule";

export const useScheduleGroup = () => {
  const { user, profile, updateProfile } = useAuth();
  const { scheduleArray } = useScheduleContext();

  const enriched = useMemo(
    () => getEnrichedScheduleArray(scheduleArray),
    [scheduleArray],
  );

  const availableGroups = useMemo(
    () => getScheduleGroups(enriched),
    [enriched],
  );

  // 🎯 Стейт — только для UI
  const [scheduleGroup, setScheduleGroupState] = useState(() =>
    getResolvedScheduleGroup(profile, availableGroups),
  );

  // 🎯 Ref — «актуальное» значение для flush (не из замыкания!)
  const scheduleGroupRef = useRef(scheduleGroup);
  useEffect(() => {
    scheduleGroupRef.current = scheduleGroup;
  }, [scheduleGroup]);

  const lastProfileScheduleGroupRef = useRef(profile?.scheduleGroup || null);
  const hasUnsavedRef = useRef(false);
  const lastSavedRef = useRef(profile?.scheduleGroup || null);

  // 🎯 Синхронизация из profile — ТОЛЬКО при реальном изменении
  useEffect(() => {
    const profileGroup = profile?.scheduleGroup || null;
    if (!profileGroup) return;
    if (!availableGroups.includes(profileGroup)) return;
    if (lastProfileScheduleGroupRef.current === profileGroup) return;

    lastProfileScheduleGroupRef.current = profileGroup;

    if (hasUnsavedRef.current) return;

    const local = getLocalScheduleGroup();
    if (local && local !== profileGroup && availableGroups.includes(local)) {
      return;
    }

    if (scheduleGroup === profileGroup) return;

    setScheduleGroupState(profileGroup);
    saveScheduleGroupLocal(profileGroup);
    lastSavedRef.current = profileGroup;
  }, [profile?.scheduleGroup, availableGroups]);

  // 🎯 Клик — меняет стейт + localStorage СРАЗУ
  const setScheduleGroup = useCallback(
    (group) => {
      if (!availableGroups.includes(group)) return;
      if (group === scheduleGroupRef.current) return;

      // 🎯 Пишем в localStorage СРАЗУ (это источник истины)
      saveScheduleGroupLocal(group);

      // 🎯 Обновляем ref и стейт
      scheduleGroupRef.current = group;
      setScheduleGroupState(group);

      if (group !== lastSavedRef.current) {
        hasUnsavedRef.current = true;
      }
    },
    [availableGroups],
  );

  const flush = useCallback(async () => {
    if (!user || !hasUnsavedRef.current) return;

    // 🎯 Читаем АКТУАЛЬНОЕ значение из ref (не из замыкания!)
    const currentGroup = scheduleGroupRef.current;

    if (!currentGroup) return;
    if (currentGroup === lastSavedRef.current) {
      hasUnsavedRef.current = false;
      return;
    }

    // 🎯 На всякий случай сохраняем в localStorage
    saveScheduleGroupLocal(currentGroup);

    try {
      const { error } = await updateProfile({ scheduleGroup: currentGroup });
      if (!error) {
        lastSavedRef.current = currentGroup;
        lastProfileScheduleGroupRef.current = currentGroup;
        hasUnsavedRef.current = false;
      }
    } catch (err) {
      console.warn("[scheduleGroup] Ошибка:", err);
    }
  }, [user, updateProfile]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedRef.current) flush();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && hasUnsavedRef.current) {
        flush();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [flush]);

  useEffect(() => {
    return () => {
      if (hasUnsavedRef.current) flush();
    };
  }, [flush]);

  const currentScheduleItem =
    enriched.find((s) => s.group === scheduleGroup) || enriched[0] || null;

  const courseId = currentScheduleItem?.course
    ? `course-${currentScheduleItem.course}`
    : "course-1";

  const season = currentScheduleItem?.season || "Осень";

  return {
    scheduleGroup,
    setScheduleGroup,
    flush,
    courseId,
    season,
    hasGroups: currentScheduleItem?.hasGroups !== false,
    currentScheduleItem,
    availableGroups,
    loading: !scheduleArray,
  };
};
