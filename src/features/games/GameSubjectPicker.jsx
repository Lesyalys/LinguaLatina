import React, { useState, useEffect, useMemo } from "react";
import { useScheduleGroup } from "../../hooks/useScheduleGroup";
import { loadMaterialData, buildMaterialPath } from "../../lib/materials";
import DataWarning from "../../components/ui/DataWarning";

const GameSubjectPicker = ({ onSelectSubject }) => {
  const { courseId, season, scheduleGroup } = useScheduleGroup();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const path = buildMaterialPath({
      courseId,
      season,
      relativePath: "manifest.json",
    });

    loadMaterialData(path).then(({ data, source }) => {
      if (cancelled) return;
      setSource(source);

      // 🎯 Берём только предметы, у которых есть action "training"
      // (игра = тренировка по лексике)
      const filtered = (data?.subjects || [])
        .map((subject) => {
          const trainingAction = (subject.actions || []).find(
            (a) => a.id === "training",
          );
          if (!trainingAction) return null;

          return {
            ...subject,
            trainingAction,
            // для GameSetup — dataFile с полным путём
            trainingDataFile: buildMaterialPath({
              courseId,
              season,
              relativePath: trainingAction.relativeFile || "",
            }),
          };
        })
        .filter(Boolean);

      setSubjects(filtered);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [courseId, season]);

  // 🎨 Цвет из темы по умолчанию
  const FALLBACK_COLOR = "#8b9cff";

  if (loading) return <div className="app-loading">Загрузка...</div>;

  return (
    <div className="game-subject-picker">
      <h1 className="page-title">🎮 Игра вдвоём</h1>
      <p className="page-subtitle">
        Выберите предмет для игры
        {scheduleGroup && (
          <>
            {" · "}
            <span className="page-subtitle-group">{scheduleGroup}</span>
          </>
        )}
      </p>

      <DataWarning source={source} />

      {subjects.length === 0 ? (
        <div className="no-results">
          <p>Для этой группы нет предметов, доступных для игры</p>
        </div>
      ) : (
        <div className="game-subjects-grid">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="game-subject-card"
              style={{
                "--subject-color": subject.color || FALLBACK_COLOR,
              }}
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
