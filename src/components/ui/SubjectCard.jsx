import React from "react";

/**
 * Универсальная карточка предмета / экзамена.
 *
 * Props:
 * - subject: объект с полями { id, title, icon, color, description, actions }
 * - onOpen: () => void — вызывается при клике на карточку
 * - actionsLimit: number (опционально) — сколько тегов показывать (по умолчанию все)
 */
const SubjectCard = ({ subject, onOpen, actionsLimit }) => {
  if (!subject) return null;

  const actions = actionsLimit
    ? subject.actions.slice(0, actionsLimit)
    : subject.actions;

  const hiddenCount = subject.actions.length - actions.length;

  return (
    <div
      className="subject-card"
      onClick={onOpen}
      style={{ "--subject-color": subject.color || "#3498db" }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen?.();
        }
      }}
    >
      <div className="subject-icon">{subject.icon}</div>
      <h2>{subject.title}</h2>
      <p>{subject.description}</p>

      {subject.actions?.length > 0 && (
        <div className="subject-tags">
          {actions.map((action) => (
            <span key={action.id} className="subject-tag">
              {action.icon} {action.title}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="subject-tag subject-tag-more">+{hiddenCount}</span>
          )}
        </div>
      )}

      <span className="subject-arrow">→</span>
    </div>
  );
};

export default SubjectCard;
