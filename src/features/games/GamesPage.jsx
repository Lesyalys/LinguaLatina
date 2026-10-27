import React, { useState } from "react";
import GameSubjectPicker from "./GameSubjectPicker";
import GameLobby from "./GameLobby";
import GameSetup from "./GameSetup";

const GamesPage = ({ onGameStart }) => {
  const [screen, setScreen] = useState("subjects"); // 'subjects' | 'lobby' | 'setup'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [pendingFriend, setPendingFriend] = useState(null);

  // 1. Выбор предмета
  if (screen === "subjects") {
    return (
      <GameSubjectPicker
        onSelectSubject={(subject) => {
          setSelectedSubject(subject);
          setScreen("lobby");
        }}
      />
    );
  }

  // 2. Лобби
  if (screen === "lobby") {
    return (
      <GameLobby
        subject={selectedSubject}
        onBack={() => {
          setSelectedSubject(null);
          setScreen("subjects");
        }}
        onOpenSetup={(friendId) => {
          setPendingFriend(friendId);
          setScreen("setup");
        }}
      />
    );
  }

  // 3. Настройка игры
  if (screen === "setup") {
    return (
      <GameSetup
        subject={selectedSubject}
        friendId={pendingFriend}
        onBack={() => setScreen("lobby")}
        onGameCreated={(gameId) => onGameStart(gameId)}
      />
    );
  }

  return null;
};

export default GamesPage;
