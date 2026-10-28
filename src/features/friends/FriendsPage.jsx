import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getFriendships,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriendship,
} from "../../lib/friends";
import UserSearch from "./UserSearch";
import FriendCard from "./FriendCard";
import RequestCard from "./RequestCard";
import { useFriendshipsRealtime } from "../../hooks/useFriendshipsRealtime";

const FriendsPage = ({ onOpenProfile }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState("friends"); // 'friends' | 'search'
  const [friendships, setFriendships] = useState({
    friends: [],
    incoming: [],
    outgoing: [],
  });
  const [loading, setLoading] = useState(true);

  // ============================================================
  // Загрузка
  // ============================================================
  const loadFriendships = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await getFriendships(user.id);
    setFriendships(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadFriendships();
  }, [loadFriendships]);

  useFriendshipsRealtime(user?.id, loadFriendships);
  // ============================================================
  // Обработчики
  // ============================================================
  const handleSendRequest = async (targetUserId) => {
    const { error } = await sendFriendRequest(user.id, targetUserId);
    if (error) {
      if (error.code === "23505") {
        alert("Заявка уже отправлена");
      } else {
        alert("Ошибка: " + error.message);
      }
      return;
    }
    await loadFriendships();
  };

  const handleAccept = async (friendshipId) => {
    const { error } = await acceptFriendRequest(friendshipId);
    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }
    await loadFriendships();
  };

  const handleRemove = async (friendshipId, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    const { error } = await removeFriendship(friendshipId);
    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }
    await loadFriendships();
  };

  // ============================================================
  // Map для UserSearch
  // ============================================================
  const relatedMap = useMemo(() => {
    const map = new Map();
    friendships.friends.forEach((f) =>
      map.set(f.user.id, { ...f, type: "friends" }),
    );
    friendships.incoming.forEach((f) =>
      map.set(f.user.id, { ...f, type: "incoming" }),
    );
    friendships.outgoing.forEach((f) =>
      map.set(f.user.id, { ...f, type: "outgoing" }),
    );
    return map;
  }, [friendships]);

  // ============================================================
  // Табы
  // ============================================================
  const tabs = [
    {
      id: "friends",
      label: "👥 Мои друзья",
      count: friendships.friends.length,
      badge: friendships.incoming.length,
    },
    { id: "search", label: "🔍 Поиск", count: null },
  ];

  // ============================================================
  // Рендер контента
  // ============================================================
  const renderFriendsTab = () => {
    const hasAny =
      friendships.friends.length > 0 ||
      friendships.incoming.length > 0 ||
      friendships.outgoing.length > 0;

    if (!hasAny) {
      return (
        <div className="friends-empty">
          <div className="friends-empty-icon">👥</div>
          <p>Здесь пока пусто</p>
          <p className="friends-empty-hint">
            Найди друзей и начни тренироваться вместе
          </p>
          <button
            className="profile-action-btn primary"
            onClick={() => setTab("search")}
          >
            🔍 Найти друзей
          </button>
        </div>
      );
    }

    return (
      <>
        {/* Входящие заявки */}
        {friendships.incoming.length > 0 && (
          <section className="friends-section">
            <h2 className="friends-section-title">
              📥 Входящие заявки
              <span className="friends-section-count">
                {friendships.incoming.length}
              </span>
            </h2>
            <div className="friends-grid">
              {friendships.incoming.map((f) => (
                <RequestCard
                  key={f.id}
                  request={f}
                  type="incoming"
                  onOpen={() => onOpenProfile(f.user.id)}
                  onAccept={() => handleAccept(f.id)}
                  onReject={() => handleRemove(f.id, "Отклонить заявку?")}
                />
              ))}
            </div>
          </section>
        )}

        {/* Исходящие заявки */}
        {friendships.outgoing.length > 0 && (
          <section className="friends-section">
            <h2 className="friends-section-title">
              📤 Исходящие заявки
              <span className="friends-section-count">
                {friendships.outgoing.length}
              </span>
            </h2>
            <div className="friends-grid">
              {friendships.outgoing.map((f) => (
                <RequestCard
                  key={f.id}
                  request={f}
                  type="outgoing"
                  onOpen={() => onOpenProfile(f.user.id)}
                  onCancel={() => handleRemove(f.id, "Отменить заявку?")}
                />
              ))}
            </div>
          </section>
        )}

        {/* Друзья */}
        {friendships.friends.length > 0 && (
          <section className="friends-section">
            <span className="friends-section-count">
              {friendships.friends.length}
            </span>
            <div className="friends-grid">
              {friendships.friends.map((f) => (
                <FriendCard
                  key={f.id}
                  friendship={f}
                  onOpen={() => onOpenProfile(f.user.id)}
                  onRemove={() =>
                    handleRemove(f.id, `Удалить ${f.user.username} из друзей?`)
                  }
                />
              ))}
            </div>
          </section>
        )}
      </>
    );
  };

  // ============================================================
  // Рендер
  // ============================================================
  return (
    <div className="friends-page">
      <div className="friends-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`friends-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className="tab-badge">{t.count}</span>
            )}
            {t.badge > 0 && (
              <span className="tab-badge tab-badge-accent">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div className="friends-content">
        {loading ? (
          <div className="friends-loading">Загрузка...</div>
        ) : (
          <>
            {tab === "friends" && renderFriendsTab()}
            {tab === "search" && (
              <UserSearch
                currentUserId={user.id}
                relatedMap={relatedMap}
                onSendRequest={handleSendRequest}
                onAcceptRequest={handleAccept}
                onRemoveFriendship={handleRemove}
                onOpenProfile={onOpenProfile}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
