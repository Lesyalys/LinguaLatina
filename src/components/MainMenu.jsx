const MainMenu = ({ onNavigate }) => {
  return (
    <div className="menu-container">
      <h1>Lingua Latina</h1>
      <p>Приложение для изучения латинского языка</p>

      <div className="menu-buttons">
        <button className="menu-btn" onClick={() => onNavigate("wordList")}>
          📖 Просмотр всех слов
        </button>

        <button
          className="menu-btn"
          onClick={() => onNavigate("trainingSetup")}
        >
          🧠 Тренировка
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
