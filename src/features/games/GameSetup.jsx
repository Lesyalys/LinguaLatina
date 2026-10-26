import React, { useState, useEffect } from "react";
import { loadMaterialData } from "../../lib/materials";
import {
  createGame,
  buildWordQueue,
  updateGameState,
  cancelGame,
} from "../../lib/games";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

const LEXICON_FILE = "courses/course-1/semester-1/latin/lexicon.json";

const GameSetup = ({ friendId, onBack, onGameCreated }) => {
  const { user } = useAuth();
  const [selectedGroups, setSelectedGroups] = useState([
    "lexs_min_1",
    "lexs_min_2",
    "lexs_min_3",
    "lexs_min_4",
  ]);
  const [rounds, setRounds] = useState(10);
  const [timePerRound, setTimePerRound] = useState(10);
  const [lexicon, setLexicon] = useState(null);
  const [creating, setCreating] = useState(false);
  const [waitingGameId, setWaitingGameId] = useState(null);

  useEffect(() => {
    loadMaterialData(LEXICON_FILE).then(({ data }) => setLexicon(data));
  }, []);

  // Слушаем смену статуса: если "active" → выходим в Room
  useEffect(() => {
    if (!waitingGameId) return;

    const channel = supabase
      .channel(`setup:${waitingGameId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${waitingGameId}`,
        },
        (payload) => {
          const game = payload.new;
          if (game.status === "active") {
            onGameCreated(game.id);
          }
          if (game.status === "cancelled") {
            setWaitingGameId(null);
            alert("Гость отклонил приглашение");
          }
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [waitingGameId, onGameCreated]);

  const toggleGroup = (g) => {
    setSelectedGroups((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  };

  const handleStart = async () => {
    if (!lexicon || selectedGroups.length === 0) return;
    setCreating(true);

    const wordQueue = buildWordQueue(lexicon, selectedGroups, rounds);

    const { data, error } = await createGame(user.id, friendId, {
      groups: selectedGroups,
      rounds,
      timePerRound,
    });

    if (error) {
      alert("Не удалось создать игру: " + error.message);
      setCreating(false);
      return;
    }

    await updateGameState(data.id, {
      state: { wordQueue, currentIndex: 0, answers: {} },
    });

    setCreating(false);
    setWaitingGameId(data.id);
  };

  const handleCancel = async () => {
    if (waitingGameId) {
      await cancelGame(waitingGameId);
      setWaitingGameId(null);
    } else {
      onBack();
    }
  };

  // Экран ожидания
  if (waitingGameId) {
    return (
      <div className="game-setup">
        <div className="game-waiting">
          <div className="game-waiting-spinner">⏳</div>
          <h2>Игра создана</h2>
          <p>Ожидаем, пока друг примет приглашение...</p>
          <button className="friend-btn danger" onClick={handleCancel}>
            Отменить
          </button>
        </div>
      </div>
    );
  }

  if (!lexicon) return <div className="app-loading">Загрузка словаря...</div>;

  return (
    <div className="game-setup">
      <button className="back-btn" onClick={onBack}>
        ← Назад
      </button>
      <h2>Настройка дуэли</h2>

      <p>Выберите минимумы:</p>
      <div className="group-selection">
        {lexicon.data.map((g) => (
          <label key={g.name} className="group-checkbox">
            <input
              type="checkbox"
              checked={selectedGroups.includes(g.name)}
              onChange={() => toggleGroup(g.name)}
            />
            <span className="checkbox-label">
              {g.name.replace("lexs_min_", "Минимум ")}
              <span className="word-count">({g.worlds.length})</span>
            </span>
          </label>
        ))}
      </div>

      <div className="game-setup-row">
        <label>Раундов:</label>
        <select value={rounds} onChange={(e) => setRounds(+e.target.value)}>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
      </div>

      <div className="game-setup-row">
        <label>Секунд на раунд:</label>
        <select
          value={timePerRound}
          onChange={(e) => setTimePerRound(+e.target.value)}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </div>

      <button
        className="start-btn"
        onClick={handleStart}
        disabled={creating || selectedGroups.length === 0}
      >
        {creating ? "Создание..." : "🎮 Создать игру"}
      </button>
    </div>
  );
};

export default GameSetup;
