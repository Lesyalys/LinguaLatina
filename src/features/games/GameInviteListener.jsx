import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { acceptGame, cancelGame } from "../../lib/games";
import { getInitials } from "../../lib/profileUtils";
import { Notice } from "../../components/ui/Notification";
import { useNotice } from "../../hooks/useNotice";

const GameInviteListener = ({ onAccepted }) => {
  const { user } = useAuth();
  const notice = useNotice();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`invite-listener:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "games" },
        async (payload) => {
          const game = payload.new;
          if (game.guest_id !== user.id || game.status !== "invited") return;

          const { data: hostProfile } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("id", game.host_id)
            .single();

          setInvite({ game, host: hostProfile });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games" },
        (payload) => {
          const game = payload.new;
          if (
            game.guest_id === user.id &&
            (game.status === "cancelled" ||
              game.status === "finished" ||
              game.status === "active")
          ) {
            setInvite(null);
          }
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const handleAccept = async () => {
    if (!invite) return;
    setLoading(true);
    const { error } = await acceptGame(invite.game.id);
    setLoading(false);

    if (error) {
      notice.show("Не удалось принять: " + error.message);
      return;
    }

    const gameId = invite.game.id;
    setInvite(null);
    onAccepted(gameId);
  };

  const handleDecline = async () => {
    if (!invite) return;
    await cancelGame(invite.game.id);
    setInvite(null);
  };

  if (!invite) return null;

  const hostName =
    invite.host?.display_name || invite.host?.username || "Игрок";

  return (
    <div className="game-invite-toast">
      <div className="game-invite-toast__header">🎮 Приглашение в игру</div>
      <Notice msg={notice.msg} type={notice.type} onClose={notice.hide} />

      <div className="game-invite-toast__body">
        <div className="game-invite-toast__avatar">
          {invite.host?.avatar_url ? (
            <img src={invite.host.avatar_url} alt={hostName} />
          ) : (
            <span>{getInitials(invite.host)}</span>
          )}
        </div>
        <div>
          <strong>{hostName}</strong> приглашает вас в дуэль
          <p className="game-invite-toast__hint">
            Минимумы:{" "}
            {(invite.game.settings?.groups || [])
              .map((g) => g.replace("lexs_min_", ""))
              .join(", ")}
            {" · "}
            Раундов: {invite.game.settings?.rounds || 10}
          </p>
        </div>
      </div>
      <div className="game-invite-toast__actions">
        <button
          className="friend-btn primary"
          onClick={handleAccept}
          disabled={loading}
        >
          ✓ {loading ? "Принятие..." : "Принять"}
        </button>
        <button
          className="friend-btn"
          onClick={handleDecline}
          disabled={loading}
        >
          ✕ Отклонить
        </button>
      </div>
    </div>
  );
};

export default GameInviteListener;
