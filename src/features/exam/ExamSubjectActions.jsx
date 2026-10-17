import React from "react";

const ExamSubjectActions = ({ subject, onOpenAction, onBack }) => {
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
            onClick={() => onOpenAction(action)}
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
