
const WelcomeHero = ({ onLogin, onOpenDictionary }) => {
  return (
    <div className="welcome-hero">
      <div className="welcome-content">
        <h1>Lingua Latina</h1>
        <p className="welcome-subtitle">
          Изучай латинский язык — основу медицинской терминологии
        </p>

        <div className="welcome-features">
          <div className="feature-card">
            <div className="feature-icon">📖</div>
            <h3>Словарь</h3>
            <p>Более 200 слов по трём лексическим минимумам с поиском</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Тренировка</h3>
            <p>Карточки для запоминания слов в интерактивном режиме</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Прогресс</h3>
            <p>Отслеживание результатов и статистики обучения</p>
          </div>
        </div>

        <div className="welcome-actions">
          <button className="welcome-btn primary" onClick={onOpenDictionary}>
            📖 Открыть словарь
          </button>
          <button className="welcome-btn secondary" onClick={onLogin}>
            👤 Войти / Зарегистрироваться
          </button>
        </div>

        <p className="welcome-note">
          💡 Для тренировок и отслеживания прогресса нужен аккаунт
        </p>
      </div>
    </div>
  );
};

export default WelcomeHero;
