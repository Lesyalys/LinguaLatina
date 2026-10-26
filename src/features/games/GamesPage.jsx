import React, { useState } from "react";
import GameLobby from "./GameLobby";
import GameSetup from "./GameSetup";

const GamesPage = ({ onGameStart }) => {
  const [screen, setScreen] = useState("lobby");
  const [pendingFriend, setPendingFriend] = useState(null);

  const handleOpenSetup = (friendId) => {
    setPendingFriend(friendId);
    setScreen("setup");
  };

  return (
    <div className="games-page">
      {screen === "lobby" && <GameLobby onOpenSetup={handleOpenSetup} />}

      {screen === "setup" && (
        <GameSetup
          friendId={pendingFriend}
          onBack={() => setScreen("lobby")}
          onGameCreated={(gameId) => onGameStart(gameId)}
        />
      )}
    </div>
  );
};

export default GamesPage;
