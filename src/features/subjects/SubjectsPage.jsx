import React from "react";

const SubjectsPage = ({ onOpenSubject }) => {
  const subjects = [
    {
      id: "latin",
      title: "Латинский язык",
      description: "Словарь и тренажёр для изучения латинской терминологии",
      icon: "🏛️",
      color: "#e67e22",
      subItems: ["Словарь", "Тренировка"],
    },
    // Здесь можно добавить: Гистология, Химия, Физика и т.д.
  ];

  return (
    <div className="subjects-page">
      <h1 className="page-title">Предметы</h1>
      <p className="page-subtitle">
        Учебные материалы для подготовки: словари, тренажёры, конспекты
      </p>

      <div className="subjects-grid">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="subject-card"
            onClick={() => onOpenSubject(subject.id)}
            style={{ "--subject-color": subject.color }}
          >
            <div className="subject-icon">{subject.icon}</div>
            <h2>{subject.title}</h2>
            <p>{subject.description}</p>
            <div className="subject-tags">
              {subject.subItems.map((item) => (
                <span key={item} className="subject-tag">
                  {item}
                </span>
              ))}
            </div>
            <span className="subject-arrow">→</span>
          </div>
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="no-results">
          <p>Предметы пока не добавлены</p>
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;
