import { useCallback, useState } from "react";
import { LEXMIN_IDS, lexminGroups, formatGroupName } from "../constants/lexicon";

const TrainingSetup = ({ onStart, onBack }) => {
  const [selectedGroups, setSelectedGroups] = useState(LEXMIN_IDS);

  const toggleGroup = useCallback((groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((g) => g !== groupId)
        : [...prev, groupId],
    );
  }, []);

  const handleStart = () => {
    if (selectedGroups.length === 0) return;

    // Собираем слова из выбранных групп
    const words = lexminGroups
      .filter((group) => selectedGroups.includes(group.id))
      .flatMap((group) => group.words.map((word) => ({ ...word, groupId: group.id })));

    onStart(words);
  };

  return (
    <div className="training-setup">
      <div className="header">
        <button onClick={onBack} className="back-btn">
          ← Назад
        </button>
        <h2>Настройка тренировки</h2>
      </div>

      <p className="setup-description">
        Выберите лексические минимумы для тренировки:
      </p>

      <div className="group-selection">
        {lexminGroups.map((group) => (
          <label key={group.id} className="group-checkbox">
            <input
              type="checkbox"
              checked={selectedGroups.includes(group.id)}
              onChange={() => toggleGroup(group.id)}
            />
            <span className="checkbox-label">
              {formatGroupName(group.id)}
              <span className="word-count">({group.words.length} слов)</span>
            </span>
          </label>
        ))}
      </div>

      <button
        className="start-btn"
        onClick={handleStart}
        disabled={selectedGroups.length === 0}
      >
        🚀 Начать тренировку
      </button>
    </div>
  );
};

export default TrainingSetup;
