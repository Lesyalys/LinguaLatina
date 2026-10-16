import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export const useIncomingRequestsCount = (userId) => {
  const [count, setCount] = useState(0);

  const loadCount = useCallback(async () => {
    if (!userId) return;

    const { count: c, error } = await supabase
      .from("friendships")
      .select("*", { count: "exact", head: true })
      .eq("friend_id", userId)
      .eq("status", "pending");

    if (!error) setCount(c || 0);
  }, [userId]);

  useEffect(() => {
    loadCount();
  }, [loadCount]);

  // Realtime
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`incoming-count:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `friend_id=eq.${userId}`,
        },
        () => {
          loadCount();
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId, loadCount]);

  return count;
};
