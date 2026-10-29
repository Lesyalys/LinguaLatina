import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export const useIncomingRequestsCount = (userId) => {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!userId) return null;

    const { count: c, error } = await supabase
      .from("friendships")
      .select("*", { count: "exact", head: true })
      .eq("friend_id", userId)
      .eq("status", "pending");

    return error ? null : c || 0;
  }, [userId]);

  const loadCount = useCallback(async () => {
    const next = await fetchCount();
    if (next !== null) setCount(next);
  }, [fetchCount]);

  useEffect(() => {
    let cancelled = false;
    fetchCount().then((next) => {
      if (!cancelled && next !== null) setCount(next);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchCount]);

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
