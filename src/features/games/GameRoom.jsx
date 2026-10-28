import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useOnlineUsers } from "../../context/PresenceContext";
import { supabase } from "../../lib/supabase";
import {
  getGame,
  updateGameState,
  finishGame,
  cancelGame,
  subscribeToGame,
} from "../../lib/games";

const RESULT_DELAY_MS = 3000;

const GameRoom = ({ gameId, onExit }) => {
  const { user } = useAuth();
  const onlineUsers = useOnlineUsers();
  const [game, setGame] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [roundResult, setRoundResult] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);
  const [opponentOffline, setOpponentOffline] = useState(false);
  const [closed, setClosed] = useState(null);
  const [profiles, setProfiles] = useState({ host: null, guest: null });
  const [showResult, setShowResult] = useState(false); // фаза "показ результата"
  const disconnectTimerRef = useRef(null);
  const exitedRef = useRef(false);
  const advanceTimerRef = useRef(null);

  const isHost = game?.host_id === user?.id;
  const myRole = isHost ? "host" : "guest";
  const opponentId = isHost ? game?.guest_id : game?.host_id;

  const myProfile = isHost ? profiles.host : profiles.guest;
  const oppProfile = isHost ? profiles.guest : profiles.host;

  const myScore = isHost ? game?.score_host : game?.score_guest;
  const oppScore = isHost ? game?.score_guest : game?.score_host;

  const wordQueue = game?.state?.wordQueue || [];
  const currentIndex = game?.state?.currentIndex || 0;
  const currentWord = wordQueue[currentIndex];
  const timePerRound = game?.settings?.timePerRound || 10;
  const answers = game?.state?.answers || {};
  const hostAnswered = !!answers.host;
  const guestAnswered = !!answers.guest;
  const bothAnswered = hostAnswered && guestAnswered;

  // Загрузка игры
  useEffect(() => {
    getGame(gameId).then(({ data }) => setGame(data));
    const unsub = subscribeToGame(gameId, (updated) => setGame(updated));
    return unsub;
  }, [gameId]);

  // Загрузка профилей (хоста и гостя)
  useEffect(() => {
    if (!game) return;
    const ids = [game.host_id, game.guest_id].filter(Boolean);
    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", ids)
      .then(({ data }) => {
        if (!data) return;
        const map = {};
        data.forEach((p) => (map[p.id] = p));
        setProfiles({
          host: map[game.host_id] || null,
          guest: map[game.guest_id] || null,
        });
      });
  }, [game?.host_id, game?.guest_id]);

  // Следим за статусом игры
  useEffect(() => {
    if (!game) return;
    if (game.status === "cancelled") setClosed({ reason: "cancelled" });
    if (game.status === "finished") setClosed({ reason: "finished" });
  }, [game?.status]);

  // Detect disconnect
  useEffect(() => {
    if (!game || !opponentId || closed) return;
    const isOnline = onlineUsers.has(opponentId);
    if (isOnline) {
      setOpponentOffline(false);
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
        disconnectTimerRef.current = null;
      }
    } else if (!disconnectTimerRef.current) {
      disconnectTimerRef.current = setTimeout(() => {
        setOpponentOffline(true);
        if (isHost) {
          finishGame(game.id, game.score_host, game.score_guest);
        }
      }, 15000);
    }
    return () => {
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
        disconnectTimerRef.current = null;
      }
    };
  }, [onlineUsers, opponentId, game, isHost, closed]);

  // ============================================================
  // Сброс состояния при новом раунде
  // ============================================================
  useEffect(() => {
    setRoundResult(null);
    setMyAnswer(null);
    setShowResult(false);
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, [currentIndex]);

  // ============================================================
  // Таймер раунда
  // ============================================================
  useEffect(() => {
    if (!currentWord || !timePerRound || closed) return;
    if (showResult) return; // результат уже показывается
    if (bothAnswered) return; // оба ответили — таймер не нужен

    setTimeLeft(timePerRound);

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          // таймаут — устанавливаем результат
          setRoundResult((prev) => {
            if (prev) return prev;
            return {
              winner: null,
              correctAnswer: currentWord.correct,
              myCorrect: false,
              timeout: true,
            };
          });
          setShowResult(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    currentIndex,
    currentWord,
    timePerRound,
    closed,
    showResult,
    bothAnswered,
  ]);

  // ============================================================
  // Фаза показа результата → автопереход через 3 сек
  // ============================================================
  useEffect(() => {
    if (!showResult || !currentWord) return;

    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);

    advanceTimerRef.current = setTimeout(async () => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= wordQueue.length) {
        await finishGame(gameId, game.score_host, game.score_guest);
        return;
      }
      await updateGameState(gameId, {
        state: { ...game.state, currentIndex: nextIndex, answers: {} },
      });
      // сброс произойдёт в useEffect по currentIndex
    }, RESULT_DELAY_MS);

    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
    };
  }, [showResult, currentIndex, currentWord, game, gameId, wordQueue.length]);

  // ============================================================
  // Обработчик ответа
  // ============================================================
  const handleAnswer = async (option) => {
    if (showResult || myAnswer || closed) return;
    setMyAnswer(option);

    const isCorrect = option === currentWord.correct;

    // Формируем ответ в game.state.answers
    const newAnswers = {
      ...answers,
      [myRole]: {
        player: myRole,
        option,
        correct: isCorrect,
        timestamp: Date.now(),
      },
    };

    // Проверяем, ответил ли уже соперник
    const opponentAnswer = answers[myRole === "host" ? "guest" : "host"];
    const willBothAnswer = !!opponentAnswer;

    // Счёт обновляем, если правильно
    let newScoreHost = game.score_host;
    let newScoreGuest = game.score_guest;
    if (isCorrect) {
      if (myRole === "host") newScoreHost += 1;
      else newScoreGuest += 1;
    }

    await updateGameState(gameId, {
      state: { ...game.state, answers: newAnswers },
      score_host: newScoreHost,
      score_guest: newScoreGuest,
    });

    // Если оба ответили — показываем результат
    if (willBothAnswer) {
      const bothCorrect = isCorrect && opponentAnswer.correct;
      const winner = (() => {
        if (isCorrect && !opponentAnswer.correct) return myRole;
        if (!isCorrect && opponentAnswer.correct) {
          return myRole === "host" ? "guest" : "host";
        }
        if (bothCorrect) {
          // сравнение timestamp
          return Date.now() < opponentAnswer.timestamp
            ? myRole
            : myRole === "host"
              ? "guest"
              : "host";
        }
        return null;
      })();

      setRoundResult({
        winner,
        correctAnswer: currentWord.correct,
        myCorrect: isCorrect,
        myAnswer: option,
        opponentAnswer: opponentAnswer.option,
      });
      setShowResult(true);
    }
  };

  // ============================================================
  // Эффект: оба ответили (даже без моего участия в handleAnswer)
  // ============================================================
  useEffect(() => {
    if (!bothAnswered || showResult || !currentWord) return;

    const hostA = answers.host;
    const guestA = answers.guest;

    const winner = (() => {
      if (hostA.correct && !guestA.correct) return "host";
      if (!hostA.correct && guestA.correct) return "guest";
      if (hostA.correct && guestA.correct) {
        return hostA.timestamp < guestA.timestamp ? "host" : "guest";
      }
      return null;
    })();

    setRoundResult({
      winner,
      correctAnswer: currentWord.correct,
      myCorrect: answers[myRole]?.correct || false,
      myAnswer: answers[myRole]?.option,
      opponentAnswer: answers[myRole === "host" ? "guest" : "host"]?.option,
    });
    setShowResult(true);
  }, [bothAnswered, showResult, currentWord, answers, myRole]);

  // ============================================================
  // Выход
  // ============================================================
  const handleExit = async () => {
    if (exitedRef.current) return;
    exitedRef.current = true;
    if (game?.status === "active" || game?.status === "invited") {
      await cancelGame(game.id);
    }
    onExit();
  };

  // ============================================================
  // Экран закрытия
  // ============================================================
  if (closed) {
    const isDraw = myScore === oppScore;
    const iWon = myScore > oppScore;

    return (
      <div className="game-room">
        <div className="game-finished">
          <div className="game-finished-icon">
            {closed.reason === "cancelled"
              ? "🚪"
              : isDraw
                ? "🤝"
                : iWon
                  ? "🏆"
                  : "💪"}
          </div>
          <h2>
            {closed.reason === "cancelled"
              ? "Игра окончена"
              : isDraw
                ? "Ничья"
                : iWon
                  ? "Победа!"
                  : "Поражение"}
          </h2>
          <div className="game-score">
            <div>
              Вы: <strong>{myScore}</strong>
            </div>
            <div>
              Соперник: <strong>{oppScore}</strong>
            </div>
          </div>
          <button className="profile-action-btn primary" onClick={onExit}>
            ← К лобби
          </button>
        </div>
      </div>
    );
  }

  if (!game) return <div className="app-loading">Загрузка игры...</div>;
  if (!currentWord)
    return <div className="app-loading">Загрузка раундов...</div>;

  // ============================================================
  // Рендер
  // ============================================================
  const getInitials = (p) =>
    (p?.display_name || p?.username || "?")[0].toUpperCase();

  return (
    <div className="game-room">
      {/* ======================================================
          Шапка: игроки, счёт, таймер
         ====================================================== */}
      <div className="game-header">
        {/* Левый игрок (я) */}
        <div className={`game-player ${myScore > oppScore ? "leading" : ""}`}>
          <div className="game-player-avatar">
            {myProfile?.avatar_url ? (
              <img src={myProfile.avatar_url} alt={myProfile.username} />
            ) : (
              <span>{getInitials(myProfile || {})}</span>
            )}
          </div>
          <div className="game-player-info">
            <strong>
              {myProfile?.display_name || myProfile?.username || "Вы"}
            </strong>
            <span className="game-player-score">{myScore}</span>
          </div>
        </div>

        {/* Центр: таймер / результат */}
        <div className="game-center">
          <div className="game-round">
            Раунд {currentIndex + 1} / {wordQueue.length}
          </div>
          <div className={`game-timer ${showResult ? "game-timer--done" : ""}`}>
            {showResult ? "⏱ Результат" : `⏱ ${timeLeft} сек`}
          </div>
        </div>

        {/* Правый игрок (соперник) */}
        <div className={`game-player ${oppScore > myScore ? "leading" : ""}`}>
          <div className="game-player-info game-player-info--right">
            <strong>
              {oppProfile?.display_name || oppProfile?.username || "Соперник"}
            </strong>
            <span className="game-player-score">{oppScore}</span>
          </div>
          <div className="game-player-avatar">
            {oppProfile?.avatar_url ? (
              <img src={oppProfile.avatar_url} alt={oppProfile.username} />
            ) : (
              <span>{getInitials(oppProfile || {})}</span>
            )}
          </div>
        </div>
        <button className="back-btn" onClick={handleExit}>
          ← Выйти
        </button>
      </div>

      {opponentOffline && (
        <div className="game-warning">⚠️ Соперник отключился. Ждём...</div>
      )}

      {/* ======================================================
          Вопрос
         ====================================================== */}
      <div className="game-question">
        <div className="game-question-label">Переведите на латынь:</div>
        <div className="game-question-word">{currentWord.translation}</div>
      </div>

      {/* ======================================================
          Варианты
         ====================================================== */}
      <div className="game-options">
        {currentWord.options.map((opt, i) => {
          let cls = "game-option";
          if (showResult) {
            if (opt === currentWord.correct) cls += " correct";
            else if (opt === myAnswer) cls += " wrong";
          } else if (opt === myAnswer) cls += " selected";
          return (
            <button
              key={i}
              className={cls}
              onClick={() => handleAnswer(opt)}
              disabled={!!myAnswer || showResult}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* ======================================================
          Результат раунда
         ====================================================== */}
      {showResult && roundResult && (
        <div className="game-result">
          {roundResult.winner === myRole && (
            <div className="game-result-line game-result-line--win">
              ✅ Вы ответили первым! +1 очко
            </div>
          )}
          {roundResult.winner && roundResult.winner !== myRole && (
            <div className="game-result-line game-result-line--lose">
              ❌ Соперник ответил первым
            </div>
          )}
          {!roundResult.winner && (
            <div className="game-result-line game-result-line--draw">
              🤝 Ничья / никто не получил очко
            </div>
          )}
          <div className="game-result-answer">
            Правильный ответ: <strong>{roundResult.correctAnswer}</strong>
          </div>
          <div className="game-result-hint">Следующий раунд через 3 сек...</div>
        </div>
      )}
    </div>
  );
};

export default GameRoom;
