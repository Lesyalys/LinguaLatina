import React from "react";
import { useAuth } from "../../context/AuthContext";

const SUBJECTS = {
  latin: {
    title: "Латинский язык",
    description: "Изучение латинской терминологии",
    icon: "🏛️",
    color: "#e67e22",
    actions: [
      {
        id: "wordList",
        title: "Словарь",
        description: "Просмотр всех слов с поиском",
        icon: "📖",
      },
      {
        id: "training",
        title: "Тренировка",
        description: "Карточки для запоминания",
        icon: "🧠",
        requiresAuth: true,
      },
    ],
  },
  // Сюда можно добавить другие предметы с их действиями
};

const SubjectActions = ({ subjectId, onOpenAction, onBack }) => {
  const { user } = useAuth();
  const subject = SUBJECTS[subjectId];

  if (!subject) {
    return (
      <div className="page-placeholder">
        <h1>Предмет не найден</h1>
        <button className="back-btn" onClick={onBack}>
          ← Назад
        </button>
      </div>
    );
  }

  return (
    <div className="subject-actions-page">
      <button className="back-btn back-btn-top" onClick={onBack}>
        ← К предметам
      </button>

      <div
        className="subject-header"
        style={{ "--subject-color": subject.color }}
      >
        <div className="subject-header-icon">{subject.icon}</div>
        <div>
          <h1 className="page-title">{subject.title}</h1>
          <p className="page-subtitle">{subject.description}</p>
        </div>
      </div>

      <div className="actions-grid">
        {subject.actions.map((action) => {
          const locked = action.requiresAuth && !user;

          return (
            <div
              key={action.id}
              className={`action-card ${locked ? "locked" : ""}`}
              onClick={() => onOpenAction(action.id)}
            >
              <div className="action-icon">{action.icon}</div>
              <h2>{action.title}</h2>
              <p>{action.description}</p>
              {locked && <div className="action-lock">🔒 Требуется вход</div>}
              <span className="action-arrow">→</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectActions;
