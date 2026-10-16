import React, { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const TrainingCards = ({ words, selectedGroups, onBack }) => {
  const { profile, updateProfile } = useAuth();

  const shuffledWords = useMemo(() => {
    return [...words].sort(() => Math.random() - 0.5);
  }, [words]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  // Флаг, чтобы не сохранять повторно
  const savedRef = useRef(false);

  const currentWord = shuffledWords[currentIndex];
  const total = shuffledWords.length;
  const progress = ((currentIndex + 1) / total) * 100;

  // ============================================================
  // Предупреждение при закрытии вкладки
  // ============================================================
  useEffect(() => {
    const hasUnsavedProgress = correctCount > 0 && !savedRef.current;

    const handleBeforeUnload = (e) => {
      if (hasUnsavedProgress) {
        e.preventDefault();
        e.returnValue = ""; // Chrome требует returnValue
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [correctCount]);

  // ============================================================
  // Построение объекта прогресса (без сохранения)
  // ============================================================
  const buildProgress = () => {
    const today = new Date().toISOString().split("T")[0];
    const oldProgress = profile?.progress || {};

    // 1. wordsLearned
    const newWordsLearned = (oldProgress.wordsLearned || 0) + correctCount;

    // 2. streak
    let newStreak = oldProgress.streak || 0;
    const lastActive = oldProgress.lastActive;

    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (lastActive === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    // 3. history
    const history = [...(oldProgress.history || [])];
    const todayEntry = history.find((h) => h.date === today);

    if (todayEntry) {
      todayEntry.words += correctCount;
    } else {
      history.push({ date: today, words: correctCount });
    }
    const trimmedHistory = history.slice(-90);

    // 4. groups
    const groups = { ...(oldProgress.groups || {}) };
    const accuracy = total > 0 ? correctCount / total : 0;

    selectedGroups.forEach((groupName) => {
      const existing = groups[groupName] || {
        completed: false,
        bestScore: 0,
        attempts: 0,
      };

      groups[groupName] = {
        completed: existing.completed || (accuracy >= 0.8 && correctCount >= 8),
        bestScore: Math.max(existing.bestScore || 0, accuracy),
        attempts: (existing.attempts || 0) + 1,
        lastAttempt: today,
      };
    });

    return {
      wordsLearned: newWordsLearned,
      streak: newStreak,
      lastActive: today,
      history: trimmedHistory,
      groups,
    };
  };

  // ============================================================
  // Сохранение прогресса
  // ============================================================
  const saveProgress = async () => {
    if (savedRef.current) return { skipped: true };

    // Ничего не делаем, если пользователь не ответил ни на одну карточку
    if (correctCount === 0) {
      savedRef.current = true;
      return { skipped: true };
    }

    setSaving(true);
    try {
      const newProgress = buildProgress();
      const { error } = await updateProfile({ progress: newProgress });
      if (error) throw error;
      savedRef.current = true;
      return { success: true };
    } catch (err) {
      console.error("Ошибка сохранения прогресса:", err);
      return { error: err };
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Полное прохождение — с экрана завершения
  // ============================================================
  const handleSaveAndExit = async () => {
    const result = await saveProgress();
    if (result?.error) {
      alert("Не удалось сохранить прогресс: " + result.error.message);
      return;
    }
    onBack();
  };

  // ============================================================
  // Досрочный выход — кнопка "Выйти"
  // ============================================================
  const handleEarlyExit = async () => {
    // Если ничего не прошёл — просто выходим без диалога
    if (correctCount === 0) {
      onBack();
      return;
    }

    // Если уже сохраняли (например, прошёл до конца и снова открыл экран) — выходим
    if (savedRef.current) {
      onBack();
      return;
    }

    const confirmExit = window.confirm(
      `Вы прошли ${correctCount} из ${total} слов.\n\n` +
        `Сохранить результаты перед выходом?`,
    );

    if (!confirmExit) return;

    const result = await saveProgress();
    if (result?.error) {
      alert("Не удалось сохранить прогресс: " + result.error.message);
      return;
    }
    onBack();
  };

  // ============================================================
  // Ответы на карточках
  // ============================================================
  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setCorrectCount((c) => c + 1);

    if (currentIndex < total - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((i) => i + 1), 150);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    if (!window.confirm("Начать заново? Текущий прогресс будет сброшен."))
      return;

    // Сбрасываем состояние
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setFinished(false);
    // НЕ сбрасываем savedRef — прогресс уже сохранён (если был)
    // Если хочешь, чтобы можно было снова сохранить — раскомментируй:
    // savedRef.current = false;
  };

  // ============================================================
  // Экран завершения
  // ============================================================
  if (finished) {
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div className="training-cards">
        <div className="training-finished">
          <div className="finished-icon">
            {accuracy >= 80 ? "🎉" : accuracy >= 50 ? "👍" : "💪"}
          </div>
          <h2>Тренировка завершена!</h2>

          <div className="finished-stats">
            <div className="finished-stat">
              <strong>{total}</strong>
              <span>слов пройдено</span>
            </div>
            <div className="finished-stat">
              <strong>{correctCount}</strong>
              <span>правильных</span>
            </div>
            <div className="finished-stat">
              <strong>{accuracy}%</strong>
              <span>точность</span>
            </div>
          </div>

          <p className="finished-message">
            {accuracy >= 80
              ? "Отличный результат! Так держать!"
              : accuracy >= 50
                ? "Хорошо, но можно лучше!"
                : "Не сдавайся, повторение — мать учения!"}
          </p>

          <div className="finished-actions">
            <button
              className="profile-action-btn"
              onClick={handleRestart}
              disabled={saving}
            >
              🔁 Пройти заново
            </button>
            <button
              className="profile-action-btn primary"
              onClick={handleSaveAndExit}
              disabled={saving}
            >
              {saving ? "Сохранение..." : "💾 Сохранить и выйти"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // Экран карточки
  // ============================================================
  return (
    <div className="training-cards">
      <div className="header">
        <button onClick={handleEarlyExit} className="back-btn">
          ← Выйти
        </button>
        <h2>Тренировка</h2>
        <span className="progress-text">
          {currentIndex + 1} / {total}
        </span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="card-container" onClick={handleFlip}>
        <div className={`card ${isFlipped ? "flipped" : ""}`}>
          <div className="card-face card-front">
            <div className="card-hint">Нажмите, чтобы увидеть ответ</div>
            <div className="card-content">
              <div className="card-translation">{currentWord.translation}</div>
            </div>
            <div className="card-group-label">
              {currentWord.group?.replace("lexs_min_", "Минимум ")}
            </div>
          </div>
          <div className="card-face card-back">
            <div className="card-hint">Оцените себя</div>
            <div className="card-content">
              <div className="card-latin">
                <strong>{currentWord.text}</strong>, {currentWord.ends}{" "}
                {currentWord.gender}
              </div>
            </div>
            <div className="card-group-label">
              {currentWord.group?.replace("lexs_min_", "Минимум ")}
            </div>
          </div>
        </div>
      </div>

      <div className="controls">
        {!isFlipped ? (
          <button className="nav-btn flip-btn" onClick={handleFlip}>
            🔄 Перевернуть
          </button>
        ) : (
          <>
            <button
              className="nav-btn answer-btn wrong"
              onClick={() => handleAnswer(false)}
            >
              ❌ Не знал
            </button>
            <button
              className="nav-btn answer-btn correct"
              onClick={() => handleAnswer(true)}
            >
              ✅ Знал
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TrainingCards;
