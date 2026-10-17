import { useOnlineUsers } from "../../context/PresenceContext";

const FriendCard = ({ friendship, onOpen, onRemove }) => {
  const u = friendship.user;
  const onlineUsers = useOnlineUsers();
  const isOnline = onlineUsers.has(u.id);
  const initials = (u.display_name || u.username || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="friend-card">
      <div className="friend-clickable" onClick={onOpen}>
        <div className="friend-avatar-wrapper">
          <div className="friend-avatar">
            {u.avatar_url ? (
              <img src={u.avatar_url} alt={u.username} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          {isOnline && <span className="online-dot" title="Онлайн" />}
        </div>
        <div className="friend-info">
          <h3>{u.display_name || u.username}</h3>
          <p>@{u.username}</p>
          {isOnline && <p className="friend-online-text">в сети</p>}
        </div>
      </div>
      <div className="friend-actions">
        <button className="friend-btn danger" onClick={onRemove}>
          🗑 Удалить
        </button>
      </div>
    </div>
  );
};

export default FriendCard;
