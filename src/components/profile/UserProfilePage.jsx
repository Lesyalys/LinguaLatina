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

  // Прогресс опыта
  const expTarget = 1000;
  const expPercent = Math.min(
    100,
    Math.round((wordsLearned / expTarget) * 100),
  );

  // ============================================================
  // Верхняя кнопка в углу обложки (зависит от статуса дружбы)
  // ============================================================
  const renderTopButton = () => {
    if (isSelf) return null;

    if (!friendship) {
      return (
        <button
          className="profile-follow-btn"
          onClick={handleSendRequest}
          disabled={actionLoading}
        >
          Подписаться <span className="plus">+</span>
        </button>
      );
    }

    if (friendship.status === "accepted") {
      return (
        <button
          className="profile-follow-btn"
          onClick={() => handleRemove(`Удалить ${profile.username} из друзей?`)}
          disabled={actionLoading}
        >
          ✓ В друзьях
        </button>
      );
    }

    if (friendship.status === "pending") {
      if (friendship.user_id === user.id) {
        return (
          <button
            className="profile-follow-btn"
            onClick={() => handleRemove("Отменить заявку?")}
            disabled={actionLoading}
          >
            ⏳ Заявка отправлена
          </button>
        );
      }
      return (
        <button
          className="profile-follow-btn"
          onClick={handleAccept}
          disabled={actionLoading}
        >
          ✓ Принять заявку
        </button>
      );
    }

    return null;
  };

  // ============================================================
  // Нижняя панель — действия (только для исходящих заявок / входящих)
  // ============================================================
  const renderBottomActions = () => {
    const actions = [];

    // Основная кнопка в панели
    if (!isSelf && friendship) {
      if (friendship.status === "accepted") {
        actions.push(
          <button
            key="remove"
            className="bottom-bar-btn"
            onClick={() =>
              handleRemove(`Удалить ${profile.username} из друзей?`)
            }
            disabled={actionLoading}
            title="Удалить из друзей"
          >
            🗑
          </button>,
        );
      }

      if (friendship.status === "pending" && friendship.user_id === user.id) {
        actions.push(
          <button
            key="cancel"
            className="bottom-bar-btn"
            onClick={() => handleRemove("Отменить заявку?")}
            disabled={actionLoading}
            title="Отменить заявку"
          >
            ⏳
          </button>,
        );
      }

      if (friendship.status === "pending" && friendship.user_id !== user.id) {
        actions.push(
          <button
            key="accept"
            className="bottom-bar-btn"
            onClick={handleAccept}
            disabled={actionLoading}
            title="Принять заявку"
          >
            ✓
          </button>,
        );
        actions.push(
          <button
            key="decline"
            className="bottom-bar-btn"
            onClick={() => handleRemove("Отклонить заявку?")}
            disabled={actionLoading}
            title="Отклонить"
          >
            ✕
          </button>,
        );
      }
    }

    if (isSelf) {
      actions.push(
        <button
          key="back"
          className="bottom-bar-btn"
          onClick={onBack}
          title="К своему профилю"
        >
          👤
        </button>,
      );
    }

    // Всегда кнопка «Назад»
    actions.push(
      <button
        key="back-btn"
        className="bottom-bar-btn"
        onClick={onBack}
        title="Назад"
      >
        ←
      </button>,
    );

    return actions;
  };

  return (
    <div className="user-profile-page">
      <div className="profile-view-card">
        {/* Обложка */}
        <div
          className="profile-cover"
          style={
            profile.cover_url
              ? { backgroundImage: `url(${profile.cover_url})` }
              : undefined
          }
        >
          {renderTopButton()}
          <div className="profile-cover-overlay" />
        </div>

        {/* Аватар + прогресс */}
        <div className="profile-view-body">
          <div className="profile-avatar-large">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="profile-progress-bar">
            <span className="progress-label">exp.</span>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Имя, био, мета */}
        <div className="profile-view-info">
          <h2>{profile.display_name || profile.username}</h2>
          <p className="profile-username">
            @{profile.username}
            {isOnline && <span className="online-indicator">● онлайн</span>}
          </p>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          <p className="profile-meta">На платформе с {memberSince}</p>
        </div>

        {/* Статистика */}
        <div className="profile-stats-row">
          <div className="profile-stat">
            <strong>{wordsLearned}</strong>
            <span>Слов</span>
          </div>
          <div className="profile-stat">
            <strong>{streak}</strong>
            <span>Дней подряд</span>
          </div>
          <div className="profile-stat">
            <strong>{completedGroups}/3</strong>
            <span>Минимумов</span>
          </div>
        </div>

        {/* Нижняя панель с действиями */}
        <div className="profile-bottom-bar">{renderBottomActions()}</div>
      </div>
    </div>
  );
};

export default UserProfilePage;
