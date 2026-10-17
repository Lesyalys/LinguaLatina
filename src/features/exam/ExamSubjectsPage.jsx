import React from "react";

const ExamSubjectsPage = ({ onOpenSubject }) => {
  const examSubjects = [
    {
      id: "anatomy",
      title: "Анатомия",
      description: "Экзаменационные билеты по анатомии человека",
      icon: "🦴",
      color: "#3498db",
      subItems: ["Билеты"],
    },
    // Здесь можно добавить: Гистология, Химия, Физика и т.д.
  ];

  return (
    <div className="subjects-page">
      <h1 className="page-title">Экзамен / Зачёт</h1>
      <p className="page-subtitle">
        Выберите предмет для подготовки к экзамену или зачёту
      </p>

      <div className="subjects-grid">
        {examSubjects.map((subject) => (
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

      {examSubjects.length === 0 && (
        <div className="no-results">
          <p>Предметы пока не добавлены</p>
        </div>
      )}
    </div>
  );
};

export default ExamSubjectsPage;
