// src/components/profile/UserProfilePage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useOnlineUsers } from "../../context/PresenceContext";
import {
  getUserProfile,
  getFriendshipWithUser,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriendship,
} from "../../lib/friends";
import ProfileCard from "./ProfileCard";

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
  // Рендер: состояния загрузки / ошибки
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

  // ============================================================
  // Верхняя кнопка (зависит от статуса дружбы)
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
  // Нижняя панель действий
  // ============================================================
  const renderBottomActions = () => {
    const actions = [];

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
          key="self"
          className="bottom-bar-btn"
          onClick={onBack}
          title="К своему профилю"
        >
          👤
        </button>,
      );
    }

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
      <ProfileCard
        profile={profile}
        topButton={renderTopButton()}
        online={isOnline}
        bottomBar={renderBottomActions()}
      />
    </div>
  );
};

export default UserProfilePage;
