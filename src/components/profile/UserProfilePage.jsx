import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useOnlineUsers } from "../../context/PresenceContext";
import {
  getUserProfile,
  getFriendshipWithUser,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriendship,
} from "../../lib/friends";

const UserProfilePage = ({ userId, onBack }) => {
  const onlineUsers = useOnlineUsers();
  const isOnline = onlineUsers.has(userId);
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [friendship, setFriendship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isSelf = user?.id === userId;

  // ============================================================
  // Загрузка профиля и статуса дружбы
  // ============================================================
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);

      const [profileRes, friendshipRes] = await Promise.all([
        getUserProfile(userId),
        isSelf
          ? Promise.resolve({ data: null })
          : getFriendshipWithUser(user.id, userId),
      ]);

      if (profileRes.error) {
        console.error("loadUserProfile error:", profileRes.error);
      }
      setProfile(profileRes.data);
      setFriendship(friendshipRes.data);
      setLoading(false);
    };

    load();
  }, [userId, user?.id, isSelf]);

  // ============================================================
  // Действия с дружбой
  // ============================================================
  const refreshFriendship = async () => {
    const { data } = await getFriendshipWithUser(user.id, userId);
    setFriendship(data);
  };

  const handleSendRequest = async () => {
    setActionLoading(true);
    const { error } = await sendFriendRequest(user.id, userId);
    setActionLoading(false);
    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }
    await refreshFriendship();
  };

  const handleAccept = async () => {
    setActionLoading(true);
    const { error } = await acceptFriendRequest(friendship.id);
    setActionLoading(false);
    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }
    await refreshFriendship();
  };

  const handleRemove = async (confirmText) => {
    if (!window.confirm(confirmText)) return;
    setActionLoading(true);
    const { error } = await removeFriendship(friendship.id);
    setActionLoading(false);
    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }
    await refreshFriendship();
  };

  // ============================================================
  // Рендер
  // ============================================================
  if (loading) {
    return <div className="page-placeholder">Загрузка профиля...</div>;
  }

  if (!profile) {
    return (
      <div className="page-placeholder">
        <h1>Профиль не найден</h1>
        <button className="back-btn" onClick={onBack}>
          ← Назад
        </button>
      </div>
    );
  }

  const initials = (profile.display_name || profile.username || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = new Date(profile.created_at).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
  });

  const streak = profile.progress?.streak || 0;
  const wordsLearned = profile.progress?.wordsLearned || 0;
  const completedGroups = Object.values(profile.progress?.groups || {}).filter(
    (g) => g.completed,
  ).length;

  // ============================================================
  // Кнопка действия в зависимости от статуса дружбы
  // ============================================================
  const renderFriendButton = () => {
    if (isSelf) {
      return (
        <button className="profile-action-btn primary" onClick={onBack}>
          ✏️ К своему профилю
        </button>
      );
    }

    if (!friendship) {
      return (
        <button
          className="profile-action-btn primary"
          onClick={handleSendRequest}
          disabled={actionLoading}
        >
          ➕ Добавить в друзья
        </button>
      );
    }

    if (friendship.status === "accepted") {
      return (
        <button
          className="profile-action-btn danger"
          onClick={() => handleRemove(`Удалить ${profile.username} из друзей?`)}
          disabled={actionLoading}
        >
          🗑 Удалить из друзей
        </button>
      );
    }

    if (friendship.status === "pending") {
      if (friendship.user_id === user.id) {
        // Я отправил заявку
        return (
          <button
            className="profile-action-btn"
            onClick={() => handleRemove("Отменить заявку?")}
            disabled={actionLoading}
          >
            ⏳ Отменить заявку
          </button>
        );
      } else {
        // Мне отправили заявку
        return (
          <div className="profile-actions-row">
            <button
              className="profile-action-btn primary"
              onClick={handleAccept}
              disabled={actionLoading}
            >
              ✓ Принять заявку
            </button>
            <button
              className="profile-action-btn"
              onClick={() => handleRemove("Отклонить заявку?")}
              disabled={actionLoading}
            >
              ✕ Отклонить
            </button>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="user-profile-page">
      <button className="back-btn back-btn-top" onClick={onBack}>
        ← Назад
      </button>

      {/* Карточка профиля */}
      <div className="profile-view-card">
        <div
          className="profile-cover"
          style={
            profile.cover_url
              ? { backgroundImage: `url(${profile.cover_url})` }
              : undefined
          }
        >
          <div className="profile-cover-overlay" />
        </div>

        <div className="profile-view-body">
          <div className="profile-avatar-large">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="profile-view-info">
            <h2>{profile.display_name || profile.username}</h2>
            <p className="profile-username">
              @{profile.username}
              {isOnline && <span className="online-indicator">● онлайн</span>}
            </p>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <p className="profile-meta">На платформе с {memberSince}</p>
          </div>

          <div className="profile-view-actions">{renderFriendButton()}</div>
        </div>
      </div>

      {/* Прогресс */}
      <div className="profile-progress-card">
        <h3>Прогресс</h3>
        <div className="profile-progress-grid">
          <div className="profile-progress-item">
            <strong>{streak}</strong>
            <span>🔥 Дней подряд</span>
          </div>
          <div className="profile-progress-item">
            <strong>{wordsLearned}</strong>
            <span>📚 Слов выучено</span>
          </div>
          <div className="profile-progress-item">
            <strong>{completedGroups}/3</strong>
            <span>✅ Минимумов пройдено</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
