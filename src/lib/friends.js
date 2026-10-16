// src/lib/friends.js
import { supabase } from "./supabase";

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, avatar_url, cover_url, bio, progress, created_at",
    )
    .eq("id", userId)
    .single();

  return { data, error };
};

// ============================================================
// Проверить, в друзьях ли текущий пользователь с данным
// ============================================================
export const getFriendshipWithUser = async (currentUserId, targetUserId) => {
  const { data, error } = await supabase
    .from("friendships")
    .select("id, user_id, friend_id, status")
    .or(
      `and(user_id.eq.${currentUserId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUserId})`,
    )
    .maybeSingle();

  return { data, error };
};

// ============================================================
// Поиск пользователей по логину или имени
// ============================================================
export const searchUsers = async (query, currentUserId) => {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .neq("id", currentUserId)
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(20);

  if (error) {
    console.error("searchUsers error:", error);
    return [];
  }
  return data || [];
};

// ============================================================
// Получить все связи пользователя (друзья, входящие, исходящие)
// ============================================================
export const getFriendships = async (currentUserId) => {
  const { data, error } = await supabase
    .from("friendships")
    .select(
      `
      id,
      user_id,
      friend_id,
      status,
      created_at,
      user_profile:profiles!friendships_user_id_fkey (id, username, display_name, avatar_url),
      friend_profile:profiles!friendships_friend_id_fkey (id, username, display_name, avatar_url)
    `,
    )
    .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);

  if (error) {
    console.error("getFriendships error:", error);
    return { friends: [], incoming: [], outgoing: [] };
  }

  const friends = [];
  const incoming = [];
  const outgoing = [];

  (data || []).forEach((row) => {
    const isSender = row.user_id === currentUserId;
    const other = isSender ? row.friend_profile : row.user_profile;

    const item = {
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      user: other, // данные собеседника
      isSender,
    };

    if (row.status === "accepted") friends.push(item);
    else if (row.status === "pending" && isSender) outgoing.push(item);
    else if (row.status === "pending" && !isSender) incoming.push(item);
  });

  return { friends, incoming, outgoing };
};

// ============================================================
// Отправить заявку в друзья
// ============================================================
export const sendFriendRequest = async (currentUserId, targetUserId) => {
  const { data, error } = await supabase
    .from("friendships")
    .insert({ user_id: currentUserId, friend_id: targetUserId })
    .select()
    .single();

  return { data, error };
};

// ============================================================
// Принять заявку
// ============================================================
export const acceptFriendRequest = async (friendshipId) => {
  const { data, error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId)
    .select()
    .single();

  return { data, error };
};

// ============================================================
// Отклонить / удалить заявку / удалить из друзей
// ============================================================
export const removeFriendship = async (friendshipId) => {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  return { error };
};
