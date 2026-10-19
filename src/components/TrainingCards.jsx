import { useCallback, useEffect, useRef, useState } from "react";
import { formatGroupShortName } from "../constants/lexicon";
import { useShuffledDeck } from "../hooks/useShuffledDeck";

const FLIP_DELAY_MS = 150;

const TrainingCards = ({ words, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Перемешанная колода: Fisher–Yates вне рендера, повторное перемешивание — без reload()
  const { deck, reshuffle } = useShuffledDeck(words);

  // Единый таймер с корректной очисткой при размонтировании
  const flipTimer = useRef(null);
  useEffect(() => () => clearTimeout(flipTimer.current), []);

  const goTo = useCallback((nextIndex) => {
    setIsFlipped(false);
    // Карточка успевает «закрыться» перед сменой слова
    clearTimeout(flipTimer.current);
    flipTimer.current = setTimeout(() => {
      setCurrentIndex(nextIndex);
    }, FLIP_DELAY_MS);
  }, []);

  const currentWord = deck[currentIndex];
  const total = deck.length;

  if (!currentWord) {
    return (
      <div className="page-placeholder">
        <h1>Нет слов для тренировки</h1>
        <button onClick={onBack} className="back-btn">
          ← Вернуться к настройке
        </button>
      </div>
    );
  }

  const handleFlip = () => setIsFlipped((prev) => !prev);

  const goNext = () => {
    if (currentIndex < total - 1) goTo(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1);
  };

  const restart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    reshuffle();
  };

  const progress = ((currentIndex + 1) / total) * 100;
  const groupLabel = formatGroupShortName(currentWord.groupId);

  return (
    <div className="training-cards">
      <div className="header">
        <button onClick={onBack} className="back-btn">
          ← Выйти
        </button>
        <h2>Тренировка</h2>
        <span className="progress-text">
          {currentIndex + 1} / {total}
        </span>
      </div>

      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div
        className="card-container"
        onClick={handleFlip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleFlip();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={
          isFlipped ? "Скрыть перевод" : "Показать латинский термин"
        }
      >
        <div className={`card ${isFlipped ? "flipped" : ""}`}>
          <div className="card-face card-front">
            <div className="card-hint">Нажмите, чтобы увидеть ответ</div>
            <div className="card-content">
              <div className="card-translation">{currentWord.translation}</div>
            </div>
            <div className="card-group-label">{groupLabel}</div>
          </div>
          <div className="card-face card-back">
            <div className="card-hint">Нажмите, чтобы вернуться</div>
            <div className="card-content">
              <div className="card-latin">
                <strong>{currentWord.text}</strong>, {currentWord.ends}{" "}
                {currentWord.gender}
              </div>
            </div>
            <div className="card-group-label">{groupLabel}</div>
          </div>
        </div>
      </div>

      <div className="controls">
        <button
          className="nav-btn"
          onClick={goPrev}
          disabled={currentIndex === 0}
        >
          ← Назад
        </button>
        <button className="nav-btn flip-btn" onClick={handleFlip}>
          🔄 Перевернуть
        </button>
        <button
          className="nav-btn"
          onClick={goNext}
          disabled={currentIndex === total - 1}
        >
          Вперед →
        </button>
      </div>

      {currentIndex === total - 1 && (
        <button className="restart-btn" onClick={restart}>
          🔁 Начать заново
        </button>
      )}
    </div>
  );
};

export default TrainingCards;
