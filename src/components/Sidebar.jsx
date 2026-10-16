import React, { useState } from "react";

const Sidebar = ({ currentScreen, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "🏠 Главная" },
    { id: "wordList", label: "📖 Словарь" },
    { id: "trainingSetup", label: "🧠 Тренировка" },
  ];

  const handleNavigate = (screen) => {
    onNavigate(screen);
    setIsOpen(false); // закрываем меню на мобильном после клика
  };

  return (
    <>
      {/* Кнопка-бургер для мобильных */}
      <button
        className="burger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Меню"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Затемнение фона при открытом меню на мобильном */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Само боковое меню */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Lingua Latina</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${currentScreen === item.id ? "active" : ""}`}
              onClick={() => handleNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-item profile-link"
            onClick={() => handleNavigate("profile")}
          >
            👤 Профиль
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
