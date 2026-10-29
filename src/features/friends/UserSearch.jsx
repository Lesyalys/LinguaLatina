import { useState, useEffect } from "react";
import { searchUsers } from "../../lib/friends";
import { getInitials } from "../../lib/profileUtils";
import { useOnlineUsers } from "../../context/PresenceContext";

const UserSearch = ({
  currentUserId,
  relatedMap, // Map<userId, { id, status, type, isSender }>
  onSendRequest,
  onAcceptRequest,
  onRemoveFriendship,
  onOpenProfile,
}) => {
  const onlineUsers = useOnlineUsers();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState({ query: "", results: [] });

  // Результаты актуальны только для того же запроса, для которого пришли.
  // searching выводится, а не ставится синхронно в эффекте.
  const searching = query.length >= 2 && search.query !== query;
  const results = search.query === query ? search.results : [];

  // Локальный оверрайд статуса — после действий пользователя
  // { [userId]: { type, friendshipId } }
  const [localStatus, setLocalStatus] = useState({});

  // Дебаунс поиска
  useEffect(() => {
    if (query.length < 2) return;

    const timer = setTimeout(async () => {
      const data = await searchUsers(query, currentUserId);
      setSearch({ query, results: data });
    }, 350);

    return () => clearTimeout(timer);
  }, [query, currentUserId]);

  // ============================================================
  // Определяем статус пользователя
  // ============================================================
  const getStatus = (userId) => {
    // Приоритет — локальный оверрайд (свежее действие)
    if (localStatus[userId]) return localStatus[userId];

    // Затем — из relatedMap
    if (relatedMap?.has(userId)) {
      const item = relatedMap.get(userId);
      return {
        type: item.type, // 'friends' | 'incoming' | 'outgoing'
        friendshipId: item.id,
        isSender: item.isSender,
      };
    }

    return { type: "none" };
  };

  // ============================================================
  // Обработчики
  // ============================================================
  const handleSend = async (userId) => {
    await onSendRequest(userId);
    setLocalStatus((prev) => ({
      ...prev,
      [userId]: { type: "outgoing" },
    }));
  };

  const handleAccept = async (userId, friendshipId) => {
    await onAcceptRequest(friendshipId);
    setLocalStatus((prev) => ({
      ...prev,
      [userId]: { type: "friends", friendshipId },
    }));
  };

  const handleRemove = async (userId, friendshipId, type) => {
    const confirmText =
      type === "outgoing"
        ? "Отменить заявку?"
        : type === "friends"
          ? "Удалить из друзей?"
          : "Отклонить заявку?";

    if (!window.confirm(confirmText)) return;

    await onRemoveFriendship(friendshipId);
    setLocalStatus((prev) => ({
      ...prev,
      [userId]: { type: "none" },
    }));
  };

  // ============================================================
  // Рендер кнопки действия
  // ============================================================
  const renderActionButton = (userId) => {
    const status = getStatus(userId);

    if (status.type === "friends") {
      return (
        <button className="friend-btn" disabled title="Уже в друзьях">
          👥 В друзьях
        </button>
      );
    }

    if (status.type === "outgoing") {
      return (
        <button
          className="friend-btn"
          onClick={() => handleRemove(userId, status.friendshipId, "outgoing")}
        >
          ⏳ Отменить
        </button>
      );
    }

    if (status.type === "incoming") {
      return (
        <button
          className="friend-btn primary"
          onClick={() => handleAccept(userId, status.friendshipId)}
        >
          ✓ Принять
        </button>
      );
    }

    return (
      <button className="friend-btn primary" onClick={() => handleSend(userId)}>
        ➕ Добавить
      </button>
    );
  };

  // ============================================================
  // Рендер
  // ============================================================
  return (
    <div className="user-search">
      <div className="search-box">
        <input
          type="text"
          placeholder="Поиск по логину или имени (мин. 2 символа)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {searching && <p className="search-status">Поиск...</p>}

      {!searching && query.length >= 2 && results.length === 0 && (
        <p className="search-status">Ничего не найдено</p>
      )}

      {results.length > 0 && (
        <div className="friends-grid">
          {results.map((u) => {
            const status = getStatus(u.id);
            const isOnline = onlineUsers.has(u.id);

            return (
              <div key={u.id} className="friend-card">
                <div
                  className="friend-clickable"
                  onClick={() => onOpenProfile(u.id)}
                >
                  <div className="friend-avatar">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt={u.username} />
                    ) : (
                      <span>{getInitials(u)}</span>
                    )}
                  </div>
                  <div className="friend-info">
                    <h3>{u.display_name || u.username}</h3>
                    <p>@{u.username}</p>
                    {isOnline && <span className="online-dot" title="Онлайн" />}
                    {status.type === "incoming" && (
                      <p className="friend-meta">хочет добавить вас</p>
                    )}
                    {status.type === "outgoing" && (
                      <p className="friend-meta">заявка отправлена</p>
                    )}
                  </div>
                </div>

                <div className="friend-actions">{renderActionButton(u.id)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
