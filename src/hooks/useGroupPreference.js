import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { GROUP_STORAGE_KEY } from "../lib/group";

export const useGroupPreference = () => {
  const { user, profile, updateProfile } = useAuth();

  const [group, setGroupState] = useState(() => {
    if (typeof window === "undefined") return "A";
    const saved = localStorage.getItem(GROUP_STORAGE_KEY);
    if (saved === "A" || saved === "B") return saved;
    if (profile?.group === "A" || profile?.group === "B") return profile.group;
    return "A";
  });

  const hasUnsavedRef = useRef(false);
  const lastSavedRef = useRef(profile?.group || "A");

  // ⚠️ Синхронизация из profile.group — ТОЛЬКО если нет несохранённых изменений
  // И только если localStorage пуст или совпадает с profile.group
  useEffect(() => {
    if (!profile?.group) return;
    if (profile.group !== "A" && profile.group !== "B") return;

    // Если есть несохранённые — не перезаписываем
    if (hasUnsavedRef.current) return;

    const localSaved = localStorage.getItem(GROUP_STORAGE_KEY);

    // Если localStorage уже "B", а profile.group "A" — оставляем "B"
    // (значит, profile ещё не догрузился с сервера)
    if (localSaved && localSaved !== profile.group) {
      return;
    }

    setGroupState(profile.group);
    localStorage.setItem(GROUP_STORAGE_KEY, profile.group);
    lastSavedRef.current = profile.group;
  }, [profile?.group]);

  const setGroup = useCallback((newGroup) => {
    if (newGroup !== "A" && newGroup !== "B") return;
    setGroupState(newGroup);
    localStorage.setItem(GROUP_STORAGE_KEY, newGroup);
    if (newGroup !== lastSavedRef.current) {
      hasUnsavedRef.current = true;
    }
  }, []);

  // 🚀 flush — надёжнее: fetch с keepalive
  const flush = useCallback(async () => {
    if (!user || !hasUnsavedRef.current) return;
    if (group === lastSavedRef.current) {
      hasUnsavedRef.current = false;
      return;
    }

    try {
      const { error } = await updateProfile({ group });
      if (!error) {
        lastSavedRef.current = group;
        hasUnsavedRef.current = false;
      } else {
        console.warn("[group] Ошибка сохранения:", error.message);
      }
    } catch (err) {
      console.warn("[group] Ошибка:", err);
    }
  }, [user, group, updateProfile]);

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

  // Unmount (SPA-переход) — flush ПОСЛЕ размонтирования (не блокирует)
  useEffect(() => {
    return () => {
      if (hasUnsavedRef.current) flush();
    };
  }, [flush]);

  return { group, setGroup, flush };
};
