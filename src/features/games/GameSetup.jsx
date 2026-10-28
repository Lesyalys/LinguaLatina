import { useState, useEffect } from "react";
import { loadMaterialData } from "../../lib/materials";
import {
  createGame,
  buildWordQueue,
  updateGameState,
  cancelGame,
} from "../../lib/games";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

const SUBJECT_DATA_FILES = {
  latin: "courses/course-1/semester-1/latin/lexicon.json",
  // anatomy: "courses/course-1/semester-1/anatomy/quiz.json",
};

const GameSetup = ({ subject, friendId, onBack, onGameCreated }) => {
  const { user } = useAuth();

  const dataFile = SUBJECT_DATA_FILES[subject?.id] || null;

  const [selectedGroups, setSelectedGroups] = useState([]);
  const [rounds, setRounds] = useState(10);
  const [timePerRound, setTimePerRound] = useState(10);
  const [lexicon, setLexicon] = useState(null);
  const [source, setSource] = useState(null); // 🆕 S3 / cache / local
  const [creating, setCreating] = useState(false);
  const [waitingGameId, setWaitingGameId] = useState(null);
  const [notice, setNotice] = useState(null); // { type: "info" | "error", text }

  // Загрузка через loadMaterialData (S3 → кеш → локально)
  useEffect(() => {
    if (!dataFile) return;
    let cancelled = false;

    setLexicon(null);
    loadMaterialData(dataFile).then(({ data, source }) => {
      if (cancelled) return;
      setLexicon(data);
      setSource(source);
      if (data?.data) {
        setSelectedGroups(data.data.map((g) => g.name));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [dataFile]);

  // Слушаем смену статуса игры
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
          if (game.status === "active") onGameCreated(game.id);
          if (game.status === "cancelled") {
            setWaitingGameId(null);
            setNotice({ type: "info", text: "Гость отклонил приглашение" });
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
    setNotice(null);

    const wordQueue = buildWordQueue(lexicon, selectedGroups, rounds);

    const { data, error } = await createGame(user.id, friendId, {
      groups: selectedGroups,
      rounds,
      timePerRound,
      subject: subject.id,
    });

    if (error) {
      setNotice({
        type: "error",
        text: "Не удалось создать игру: " + error.message,
      });
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

  if (!dataFile) {
    return (
      <div className="page-placeholder">
        <p>Для этого предмета игра недоступна</p>
        <button className="back-btn" onClick={onBack}>
          ← Назад
        </button>
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

      {notice && (
        <div
          className={`game-notice ${
            notice.type === "error" ? "game-notice--error" : ""
          }`}
          role="alert"
          onClick={() => setNotice(null)}
        >
          {notice.text}
        </div>
      )}

      {/* 🆕 Индикатор источника */}
      {source && source !== "s3" && source !== "cache" && (
        <div className="game-source-warning">
          ⚠️ Данные из локальной копии — возможны неточности
        </div>
      )}

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
