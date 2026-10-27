import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useOnlineUsers } from "../../context/PresenceContext";
import { getFriendships } from "../../lib/friends";
import { acceptGame, cancelGame } from "../../lib/games";
import { supabase } from "../../lib/supabase";

const GameLobby = ({ subject, onBack, onOpenSetup }) => {
  const { user } = useAuth();
  const onlineUsers = useOnlineUsers();
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { friends: f } = await getFriendships(user.id);
    setFriends(f);

    const { data: games } = await supabase
      .from("games")
      .select("*")
      .eq("status", "invited")
      .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`);

    if (games) {
      setIncoming(games.filter((g) => g.guest_id === user.id));
      setOutgoing(games.filter((g) => g.host_id === user.id));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`lobby:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games" },
        () => loadData(),
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, loadData]);

  const handleAccept = async (gameId) => {
    const { error } = await acceptGame(gameId);
    if (error) {
      alert("Ошибка: " + error.message);
      return;
    }
    // Дальше App сам перекинет в GameRoom через глобальную подписку
  };

  const handleDecline = async (gameId) => {
    await cancelGame(gameId);
    loadData();
  };

  if (loading) return <div className="app-loading">Загрузка...</div>;

  return (
    <div className="game-lobby">
      <div className="game-lobby-header">
        <button className="back-btn" onClick={onBack}>
          ← К предметам
        </button>
        <h1 className="page-title">
          {subject.icon} {subject.title}
        </h1>
      </div>
      <h1 className="page-title">🎮 Игра вдвоём</h1>

      {incoming.length > 0 && (
        <div className="lobby-section">
          <h2 className="lobby-section-title">📥 Приглашения</h2>
          {incoming.map((g) => (
            <div key={g.id} className="lobby-invite">
              <div>
                <strong>Входящее приглашение</strong>
                <p>
                  Раундов: {g.settings?.rounds || 10} · Время:{" "}
                  {g.settings?.timePerRound || 10} сек
                </p>
              </div>
              <div className="lobby-invite-actions">
                <button
                  className="friend-btn primary"
                  onClick={() => handleAccept(g.id)}
                >
                  ✓ Принять
                </button>
                <button
                  className="friend-btn"
                  onClick={() => handleDecline(g.id)}
                >
                  ✕ Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {outgoing.length > 0 && (
        <div className="lobby-section">
          <h2 className="lobby-section-title">📤 Отправленные</h2>
          {outgoing.map((g) => (
            <div key={g.id} className="lobby-invite">
              <div>
                <strong>Ожидает ответа...</strong>
                <p>Раундов: {g.settings?.rounds || 10}</p>
              </div>
              <button
                className="friend-btn danger"
                onClick={() => handleDecline(g.id)}
              >
                Отменить
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="lobby-section">
        <h2 className="lobby-section-title">👥 Друзья онлайн</h2>
        {friends.length === 0 ? (
          <div className="friends-empty">
            <p>Пока нет друзей</p>
          </div>
        ) : (
          <div className="friends-grid">
            {friends.map((f) => {
              const online = onlineUsers.has(f.user.id);
              return (
                <div key={f.id} className="friend-card">
                  <div className="friend-avatar-wrapper">
                    <div className="friend-avatar">
                      {f.user.avatar_url ? (
                        <img src={f.user.avatar_url} alt={f.user.username} />
                      ) : (
                        <span>
                          {(f.user.display_name ||
                            f.user.username ||
                            "?")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    {online && <span className="online-dot" />}
                  </div>
                  <div className="friend-info">
                    <h3>{f.user.display_name || f.user.username}</h3>
                    <p>{online ? "🟢 онлайн" : "⚫ офлайн"}</p>
                  </div>
                  <div className="friend-actions">
                    <button
                      className="friend-btn primary"
                      onClick={() => onOpenSetup(f.user.id)}
                      disabled={!online}
                    >
                      🎮 Пригласить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLobby;
