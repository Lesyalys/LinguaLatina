import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "user-group-preference";

export const useGroupPreference = () => {
  const { user, profile, updateProfile } = useAuth();

  const [group, setGroupState] = useState(() => {
    if (typeof window === "undefined") return "A";
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "A" || saved === "B") return saved;
    if (profile?.group === "A" || profile?.group === "B") return profile.group;
    return "A";
  });

  const hasUnsavedRef = useRef(false);
  const lastSavedRef = useRef(profile?.group || "A");

  useEffect(() => {
    if (!profile?.group) return;
    if (profile.group !== "A" && profile.group !== "B") return;
    if (hasUnsavedRef.current) return;

    const localSaved = localStorage.getItem(STORAGE_KEY);
    if (localSaved && localSaved !== profile.group) return;

    setGroupState(profile.group);
    localStorage.setItem(STORAGE_KEY, profile.group);
    lastSavedRef.current = profile.group;
  }, [profile?.group]);

  const setGroup = useCallback((newGroup) => {
    if (newGroup !== "A" && newGroup !== "B") return;
    setGroupState(newGroup);
    localStorage.setItem(STORAGE_KEY, newGroup);
    if (newGroup !== lastSavedRef.current) {
      hasUnsavedRef.current = true;
    }
  }, []);

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

  useEffect(() => {
    return () => {
      if (hasUnsavedRef.current) flush();
    };
  }, [flush]);

  return { group, setGroup, flush };
};
