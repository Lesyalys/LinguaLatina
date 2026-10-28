import { useOnlineUsers } from "../../context/PresenceContext";
import { getInitials } from "../../lib/profileUtils";

const RequestCard = ({
  request,
  type,
  onOpen,
  onAccept,
  onReject,
  onCancel,
}) => {
  const u = request.user;
  const onlineUsers = useOnlineUsers();
  const isOnline = onlineUsers.has(u.id);
  const initials = getInitials(u);

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
          <p className="friend-meta">
            {type === "incoming" ? "хочет добавить вас" : "заявка отправлена"}
          </p>
        </div>
      </div>
      <div className="friend-actions">
        {type === "incoming" && (
          <>
            <button className="friend-btn primary" onClick={onAccept}>
              ✅ Принять
            </button>
            <button className="friend-btn danger" onClick={onReject}>
              ✕ Отклонить
            </button>
          </>
        )}
        {type === "outgoing" && (
          <button className="friend-btn danger" onClick={onCancel}>
            Отменить
          </button>
        )}
      </div>
    </div>
  );
};

export default RequestCard;
