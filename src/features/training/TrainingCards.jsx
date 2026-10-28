import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { shuffleArray } from "../../lib/shuffle";
import {
  updateSubjectProgress,
  getSubjectProgress,
  updateHistory,
} from "../../lib/progress";

const TrainingCards = ({ words, onBack }) => {
  const { profile, updateProfile } = useAuth();

  // Слова приходят уже перемешанными (перемешивание делается на старте).
  // При «Пройти заново» перемешиваем заново — в обработчике, а не в рендере.
  const [reshuffledWords, setReshuffledWords] = useState(null);
  const shuffledWords = reshuffledWords || words;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  // ✅ массив слов, которые пользователь отметил как «Знал»
  const [correctWords, setCorrectWords] = useState([]);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  const savedRef = useRef(false);

  const currentWord = shuffledWords[currentIndex];
  const total = shuffledWords.length;
  const progress = ((currentIndex + 1) / total) * 100;

  // ============================================================
  // Предупреждение о закрытии вкладки
  // ============================================================
  useEffect(() => {
    const hasUnsavedProgress = correctWords.length > 0 && !savedRef.current;

    const handleBeforeUnload = (e) => {
      if (hasUnsavedProgress) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [correctWords]);

  // ============================================================
  // Построение прогресса — УНИКАЛЬНЫЕ СЛОВА
  // ============================================================
  const buildProgress = (wordsLearnedThisSession) => {
    const today = new Date().toISOString().split("T")[0];
    const oldProgress = profile?.progress || {};

    // 1. Читаем старый прогресс по латыни
    const oldLatin = getSubjectProgress(
      oldProgress,
      "course-1",
      "semester-1",
      "latin",
    ) || {
      wordsLearned: [],
      attempts: 0,
    };

    // 2. Уникальные слова
    const oldSet = new Set(oldLatin.wordsLearned || []);
    wordsLearnedThisSession.forEach((w) => oldSet.add(w.text));
    const uniqueWords = Array.from(oldSet);

    // 3. Обновляем subject "latin"
    let newProgress = updateSubjectProgress(
      oldProgress,
      "course-1",
      "semester-1",
      "latin",
      {
        type: "subject",
        wordsLearned: uniqueWords,
        attempts: (oldLatin.attempts || 0) + 1,
        lastActive: today,
      },
    );

    // 4. Обновляем history
    newProgress = updateHistory(newProgress, today, {
      words: uniqueWords.length,
    });

    return newProgress;
  };
  // ============================================================
  // Сохранение
  // ============================================================
  const saveProgress = async () => {
    if (savedRef.current) return { skipped: true };
    if (correctWords.length === 0) {
      savedRef.current = true;
      return { skipped: true };
    }

    setSaving(true);
    try {
      const newProgress = buildProgress(correctWords);
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

  const handleSaveAndExit = async () => {
    const result = await saveProgress();
    if (result?.error) {
      alert("Не удалось сохранить прогресс: " + result.error.message);
      return;
    }
    onBack();
  };

  const handleEarlyExit = async () => {
    if (correctWords.length === 0) {
      onBack();
      return;
    }
    if (savedRef.current) {
      onBack();
      return;
    }

    const confirmExit = window.confirm(
      `Вы прошли ${correctWords.length} из ${total} слов.\n\n` +
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
  // Ответы
  // ============================================================
  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setCorrectWords((prev) => [...prev, currentWord]);
    }

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

    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectWords([]);
    setFinished(false);
    setReshuffledWords(shuffleArray(words));
  };

  // ============================================================
  // Экран завершения
  // ============================================================
  if (finished) {
    const accuracy =
      total > 0 ? Math.round((correctWords.length / total) * 100) : 0;

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
              <strong>{correctWords.length}</strong>
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
        <div className={`flip-card ${isFlipped ? "flipped" : ""}`}>
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
