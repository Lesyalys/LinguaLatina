import React from "react";

const EXAM_SUBJECTS = {
  anatomy: {
    title: "Анатомия",
    description: "Подготовка к экзамену по анатомии",
    icon: "🦴",
    color: "#3498db",
    actions: [
      {
        id: "tickets",
        title: "Билеты",
        description: "Полный список билетов с вопросами и ответами",
        icon: "📝",
      },
      // Позже: 'tests', 'flashcards' и т.д.
    ],
  },
  // Сюда можно добавить гистологию, химию...
};

const ExamSubjectActions = ({ subjectId, onOpenAction, onBack }) => {
  const subject = EXAM_SUBJECTS[subjectId];

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
        {subject.actions.map((action) => (
          <div
            key={action.id}
            className="action-card"
            onClick={() => onOpenAction(action.id)}
          >
            <div className="action-icon">{action.icon}</div>
            <h2>{action.title}</h2>
            <p>{action.description}</p>
            <span className="action-arrow">→</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamSubjectActions;
