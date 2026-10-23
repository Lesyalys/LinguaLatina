import { useState, useEffect } from "react";
import { loadMaterialData } from "../../lib/materials";
import DataWarning from "../../components/ui/DataWarning";

const TrainingSetup = ({ dataFile, onStart, onBack }) => {
  const [selectedGroups, setSelectedGroups] = useState([
    "lexs_min_1",
    "lexs_min_2",
    "lexs_min_3",
  ]);
  const [lexicon, setLexicon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadMaterialData(dataFile).then(({ data, source }) => {
      if (!cancelled) {
        setLexicon(data);
        setSource(source);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dataFile]);

  // ✅ хуки закончились — теперь можно return
  if (loading) return <div className="app-loading">Загрузка...</div>;
  if (!lexicon)
    return <div className="page-placeholder">Не удалось загрузить данные</div>;

  const toggleGroup = (groupName) => {
    setSelectedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName],
    );
  };

  const handleStart = () => {
    if (selectedGroups.length === 0) return;

    const words = [];
    lexicon.data.forEach((group) => {
      if (selectedGroups.includes(group.name)) {
        group.worlds.forEach((word) => {
          words.push({ ...word, group: group.name });
        });
      }
    });

    onStart(words, selectedGroups);
  };

  return (
    <div className="training-setup">
      <div className="header">
        <button onClick={onBack} className="back-btn">
          ← Назад
        </button>
        <h2>Настройка тренировки</h2>
      </div>
      <DataWarning source={source} />
      <p className="setup-description">
        Выберите лексические минимумы для тренировки:
      </p>

      <div className="group-selection">
        {lexicon.data.map((group) => (
          <label key={group.name} className="group-checkbox">
            <input
              type="checkbox"
              checked={selectedGroups.includes(group.name)}
              onChange={() => toggleGroup(group.name)}
            />
            <span className="checkbox-label">
              {group.name.replace("lexs_min_", "Лексический минимум ")}
              <span className="word-count">({group.worlds.length} слов)</span>
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
