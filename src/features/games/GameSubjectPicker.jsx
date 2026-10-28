import { getSubjects } from "../../lib/materials";
import { useFilter } from "../../context/FilterContext";

// 🎮 Только предметы, у которых есть action для игры
const getGameSubjects = (courseId, semesterId) => {
  const all = getSubjects({ courseId, semesterId, type: "subject" });
  return all
    .map((subject) => {
      // Ищем action "training" или "wordList" — то, что использует GameSetup
      const gameAction =
        subject.actions?.find((a) => a.id === "training") ||
        subject.actions?.find((a) => a.id === "wordList");

      return {
        ...subject,
        available: !!gameAction,
        gameAction, // сохраняем для отладки
      };
    })
    .filter((s) => s.available); // показываем только те, где есть игра
};

const GameSubjectPicker = ({ onSelectSubject }) => {
  const { courseId, semesterId } = useFilter();
  const subjects = getGameSubjects(courseId, semesterId);

  return (
    <div className="game-subject-picker">
      <h1 className="page-title">🎮 Игра вдвоём</h1>
      <p className="page-subtitle">Выберите предмет для игры</p>

      {subjects.length === 0 ? (
        <div className="no-results">
          <p>Пока нет предметов, доступных для игры</p>
        </div>
      ) : (
        <div className="game-subjects-grid">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="game-subject-card"
              style={{ "--subject-color": subject.color }}
              onClick={() => onSelectSubject(subject)}
            >
              <div className="game-subject-icon">{subject.icon}</div>
              <h2>{subject.title}</h2>
              <p>{subject.description}</p>
              <span className="game-subject-arrow">→</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameSubjectPicker;
