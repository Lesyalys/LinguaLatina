import { useState, useMemo } from "react";

const TrainingCards = ({ words, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Перемешиваем слова один раз при монтировании
  const shuffledWords = useMemo(() => {
    return [...words].sort(() => Math.random() - 0.5);
  }, [words]);

  const currentWord = shuffledWords[currentIndex];
  const total = shuffledWords.length;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const goNext = () => {
    if (currentIndex < total - 1) {
      setIsFlipped(false);
      // Небольшая задержка, чтобы карточка успела "закрыться" перед сменой слова
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 150);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
      }, 150);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    // Перемешиваем заново через хак (пересоздаст useMemo)
    window.location.reload();
  };

  const progress = ((currentIndex + 1) / total) * 100;

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

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="card-container" onClick={handleFlip}>
        <div className={`card ${isFlipped ? "flipped" : ""}`}>
          <div className="card-face card-front">
            <div className="card-hint">Нажмите, чтобы увидеть ответ</div>
            <div className="card-content">
              <div className="card-translation">{currentWord.translation}</div>
            </div>
            <div className="card-group-label">
              {currentWord.group.replace("lexs_min_", "Минимум ")}
            </div>
          </div>
          <div className="card-face card-back">
            <div className="card-hint">Нажмите, чтобы вернуться</div>
            <div className="card-content">
              <div className="card-latin">
                <strong>{currentWord.text}</strong>, {currentWord.ends}{" "}
                {currentWord.gender}
              </div>
            </div>
            <div className="card-group-label">
              {currentWord.group.replace("lexs_min_", "Минимум ")}
            </div>
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
