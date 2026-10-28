import { useEffect } from "react";
import { supabase } from "../lib/supabase";

/**
 * Слушает изменения в friendships для текущего пользователя
 * и вызывает onUpdate() при любом изменении.
 */
export const useFriendshipsRealtime = (userId, onUpdate) => {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`friendships:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "friendships",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          onUpdate();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `friend_id=eq.${userId}`,
        },
        () => {
          onUpdate();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onUpdate]);
};
