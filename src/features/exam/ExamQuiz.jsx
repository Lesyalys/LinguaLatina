import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { loadMaterialData } from "../../lib/materials";

const ExamQuiz = ({ dataFile, onBack }) => {
  const { profile, updateProfile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [stage, setStage] = useState("setup");
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [shuffleQuestions, setShuffleQuestions] = useState(true);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCardIds, setCorrectCardIds] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadMaterialData(dataFile).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dataFile]);

  const tickets = useMemo(() => data?.data || [], [data]);

  const prepareQuestions = (ticketNumbers, shuffle) => {
    const allCards = [];
    tickets.forEach((ticket) => {
      if (!ticketNumbers.has(ticket.ticket)) return;
      ticket.questions.forEach((question) => {
        (question.cards || []).forEach((card) => {
          allCards.push({
            ...card,
            ticketNumber: ticket.ticket,
            questionTitle: question.title,
          });
        });
      });
    });

    if (shuffle) {
      for (let i = allCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
      }
    }
    return allCards;
  };

  // Настройка
  const toggleTicket = (n) => {
    setSelectedTickets((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };
  const selectAll = () =>
    setSelectedTickets(new Set(tickets.map((t) => t.ticket)));
  const clearAll = () => setSelectedTickets(new Set());

  const startQuiz = () => {
    if (selectedTickets.size === 0) return;
    const prepared = prepareQuestions(selectedTickets, shuffleQuestions);
    if (prepared.length === 0) {
      alert("В выбранных билетах нет вопросов");
      return;
    }
    setQuestions(prepared);
    setCurrentIndex(0);
    setCorrectCardIds([]);
    setSelectedOption(null);
    setShowExplanation(false);
    setStage("quiz");
  };

  const currentCard = questions[currentIndex];
  const total = questions.length;
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  const handleSelectOption = (idx) => {
    if (showExplanation) return;
    setSelectedOption(idx);
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentCard.correct;
    if (isCorrect) {
      setCorrectCardIds((prev) => [...prev, currentCard.id]);
    }

    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setStage("finished");
    }
  };

  // ============================================================
  // Сохранение прогресса — уникальные card.id
  // ============================================================
  const buildProgress = (correctIds) => {
    const today = new Date().toISOString().split("T")[0];
    const oldProgress = profile?.progress || {};
    const subjects = { ...(oldProgress.subjects || {}) };

    const oldAnatomy = subjects.anatomy || {
      type: "exam",
      quizLearned: [],
      attempts: 0,
    };

    const oldSet = new Set(oldAnatomy.quizLearned || []);
    correctIds.forEach((id) => oldSet.add(id));
    const uniqueCards = Array.from(oldSet);

    subjects.anatomy = {
      ...oldAnatomy,
      type: "exam",
      quizLearned: uniqueCards,
      attempts: (oldAnatomy.attempts || 0) + 1,
      lastActive: today,
    };

    const history = [...(oldProgress.history || [])];
    const todayEntry = history.find((h) => h.date === today);

    if (todayEntry) {
      todayEntry.quizAnswers = uniqueCards.length;
    } else {
      history.push({ date: today, quizAnswers: uniqueCards.length });
    }

    return {
      lastActive: today,
      history: history.slice(-90),
      subjects,
    };
  };
  const saveProgress = async () => {
    if (correctCardIds.length === 0) return { skipped: true };
    setSaving(true);
    try {
      const newProgress = buildProgress(correctCardIds);
      const { error } = await updateProfile({ progress: newProgress });
      if (error) throw error;
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
      alert("Не удалось сохранить: " + result.error.message);
      return;
    }
    onBack();
  };

  const handleRestart = () => {
    setStage("setup");
    setQuestions([]);
    setCurrentIndex(0);
    setCorrectCardIds([]);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  if (loading) return <div className="app-loading">Загрузка...</div>;
  if (!data)
    return <div className="page-placeholder">Не удалось загрузить данные</div>;

  // ============================================================
  // Setup
  // ============================================================
  if (stage === "setup") {
    const totalQuestions = tickets
      .filter((t) => selectedTickets.has(t.ticket))
      .reduce(
        (acc, t) =>
          acc + t.questions.reduce((a, q) => a + (q.cards?.length || 0), 0),
        0,
      );

    return (
      <div className="exam-quiz">
        <div className="header">
          <button onClick={onBack} className="back-btn">
            ← Назад
          </button>
          <h2>Тест по билетам</h2>
        </div>

        <p className="setup-description">Выберите билеты для теста:</p>

        <div className="quiz-setup-actions">
          <button className="quiz-setup-btn" onClick={selectAll}>
            Выбрать все
          </button>
          <button className="quiz-setup-btn" onClick={clearAll}>
            Снять все
          </button>
        </div>

        <div className="quiz-ticket-list">
          {tickets.map((ticket) => {
            const cardCount = ticket.questions.reduce(
              (a, q) => a + (q.cards?.length || 0),
              0,
            );
            const isChecked = selectedTickets.has(ticket.ticket);
            return (
              <label
                key={ticket.ticket}
                className={`quiz-ticket-item ${isChecked ? "checked" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleTicket(ticket.ticket)}
                />
                <div className="quiz-ticket-info">
                  <strong>Билет №{ticket.ticket}</strong>
                  <span>
                    {ticket.questions.length} вопросов · {cardCount} заданий
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        <label className="quiz-shuffle-toggle">
          <input
            type="checkbox"
            checked={shuffleQuestions}
            onChange={(e) => setShuffleQuestions(e.target.checked)}
          />
          <span>Перемешивать вопросы</span>
        </label>

        <button
          className="start-btn"
          onClick={startQuiz}
          disabled={selectedTickets.size === 0}
        >
          🚀 Начать тест {totalQuestions > 0 && `(${totalQuestions} заданий)`}
        </button>
      </div>
    );
  }

  // ============================================================
  // Finished
  // ============================================================
  if (stage === "finished") {
    const correctCount = correctCardIds.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div className="exam-quiz">
        <div className="training-finished">
          <div className="finished-icon">
            {accuracy >= 80 ? "🎉" : accuracy >= 50 ? "👍" : "💪"}
          </div>
          <h2>Тест завершён!</h2>

          <div className="finished-stats">
            <div className="finished-stat">
              <strong>{total}</strong>
              <span>заданий</span>
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
              ? "Отличный результат! Готов к экзамену!"
              : accuracy >= 50
                ? "Хорошо, но стоит повторить слабые темы."
                : "Не сдавайся, повтори материал!"}
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
  // Quiz
  // ============================================================
  const isCorrect = showExplanation && selectedOption === currentCard.correct;

  return (
    <div className="exam-quiz">
      <div className="header">
        <button onClick={onBack} className="back-btn">
          ← Выйти
        </button>
        <h2>Тест по билетам</h2>
        <span className="progress-text">
          {currentIndex + 1} / {total}
        </span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="quiz-card">
        <div className="quiz-meta">
          <span className="quiz-ticket-badge">
            Билет №{currentCard.ticketNumber}
          </span>
          <span className="quiz-question-title">
            {currentCard.questionTitle}
          </span>
        </div>

        <h3 className="quiz-question">{currentCard.question}</h3>

        <div className="quiz-options">
          {currentCard.options.map((option, idx) => {
            let className = "quiz-option";
            if (showExplanation) {
              if (idx === currentCard.correct) className += " correct";
              else if (idx === selectedOption) className += " wrong";
            } else if (idx === selectedOption) {
              className += " selected";
            }

            return (
              <button
                key={idx}
                className={className}
                onClick={() => handleSelectOption(idx)}
                disabled={showExplanation}
              >
                <span className="quiz-option-letter">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="quiz-option-text">{option}</span>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div
            className={`quiz-explanation ${isCorrect ? "correct" : "wrong"}`}
          >
            <strong>{isCorrect ? "✅ Верно!" : "❌ Неверно"}</strong>
            <p>{currentCard.explanation}</p>
          </div>
        )}

        <div className="quiz-actions">
          {!showExplanation ? (
            <button
              className="nav-btn flip-btn"
              onClick={handleCheck}
              disabled={selectedOption === null}
            >
              Проверить
            </button>
          ) : (
            <button className="nav-btn flip-btn" onClick={handleNext}>
              {currentIndex < total - 1 ? "Далее →" : "Завершить"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamQuiz;
