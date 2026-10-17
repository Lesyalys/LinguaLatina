import React from "react";

const ExamSubjects = ({ onOpenSubject }) => {
  const subjects = [
    {
      id: "anatomy",
      title: "Анатомия",
      description: "Экзаменационные билеты по анатомии человека",
      icon: "🦴",
      color: "#3498db",
    },
    // Сюда можно добавлять другие предметы
  ];

  return (
    <div className="exam-subjects-page">
      <h1 className="page-title">Подготовка к экзамену</h1>
      <p className="page-subtitle">
        Выберите предмет для подготовки. Внутри — билеты и вопросы с ответами.
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
            <span className="subject-arrow">→</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamSubjects;
