
const CourseProgress = () => {
  const progress = 15; // Заглушка - 15%

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
              strokeDasharray={`${progress}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" className="progress-circle-text">
              {progress}%
            </text>
          </svg>
        </div>
      </div>

      <div className="progress-details">
        <div className="progress-item">
          <span>📚 Минимум 1</span>
          <span className="progress-status done">✓ Пройден</span>
        </div>
        <div className="progress-item">
          <span>📚 Минимум 2</span>
          <span className="progress-status in-progress">В процессе</span>
        </div>
        <div className="progress-item">
          <span>📚 Минимум 3</span>
          <span className="progress-status locked">🔒 Заблокирован</span>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;
