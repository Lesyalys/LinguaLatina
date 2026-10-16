import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

/**
 * Глобальный presence-канал. Все авторизованные пользователи
 * подключаются к нему и видят друг друга онлайн.
 */
export const usePresence = (user, profile) => {
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!user || !profile) return;

    const channel = supabase.channel("online-users", {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnlineUsers(new Set(Object.keys(state)));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, profile?.id]); // ← важно: только id, а не объекты

  return onlineUsers;
};
