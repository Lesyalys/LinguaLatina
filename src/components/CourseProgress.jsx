import React from "react";
import { useAuth } from "../context/AuthContext";

const CourseProgress = () => {
  const { profile } = useAuth();
  const progress = profile?.progress || {};
  const groups = progress.groups || {};

  // Считаем процент: 3 минимума → 33.3% за каждый
  const completedCount = Object.values(groups).filter(
    (g) => g.completed,
  ).length;
  const percent = Math.round((completedCount / 3) * 100);

  const renderGroupStatus = (groupName, index) => {
    const g = groups[groupName];
    let status, label;

    if (!g || !g.attempts) {
      status = "locked";
      label = "🔒 Не начат";
    } else if (g.completed) {
      status = "done";
      label = "✓ Пройден";
    } else {
      status = "in-progress";
      label = `В процессе (${Math.round((g.bestScore || 0) * 100)}%)`;
    }

    return (
      <div className="progress-item" key={groupName}>
        <span>📚 Минимум {index + 1}</span>
        <span className={`progress-status ${status}`}>{label}</span>
      </div>
    );
  };

  return (
    <div className="card progress-card">
      <h3>Прогресс по курсу</h3>
      <p className="progress-subtitle">Основы латинской терминологии</p>

      <div className="progress-circle-wrapper">
        <div className="progress-circle">
          <svg viewBox="0 0 36 36">
            <path
              className="progress-circle-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="progress-circle-fill"
              strokeDasharray={`${percent}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" className="progress-circle-text">
              {percent}%
            </text>
          </svg>
        </div>
      </div>

      <div className="progress-details">
        {renderGroupStatus("lexs_min_1", 0)}
        {renderGroupStatus("lexs_min_2", 1)}
        {renderGroupStatus("lexs_min_3", 2)}
      </div>
    </div>
  );
};

export default CourseProgress;
