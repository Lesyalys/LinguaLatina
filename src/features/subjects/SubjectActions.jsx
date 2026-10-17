import { useAuth } from "../../context/AuthContext";

export const SubjectActions = ({ subject, onOpenAction, onBack }) => {
  const { user } = useAuth();

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
              onClick={() => onOpenAction(action)}
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
