import { useState } from "react";
import { SCREENS } from "../constants/screens";

const MENU_ITEMS = [
  { id: SCREENS.HOME, label: "🏠 Главная" },
  { id: SCREENS.WORD_LIST, label: "📖 Словарь" },
  { id: SCREENS.TRAINING_SETUP, label: "🧠 Тренировка" },
];

const Sidebar = ({ currentScreen, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

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
        aria-expanded={isOpen}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Затемнение фона при открытом меню на мобильном */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Само боковое меню */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Lingua Latina</h2>
        </div>

        <nav className="sidebar-nav" aria-label="Основная навигация">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${currentScreen === item.id ? "active" : ""}`}
              onClick={() => handleNavigate(item.id)}
              aria-current={currentScreen === item.id ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-item profile-link"
            onClick={() => handleNavigate(SCREENS.PROFILE)}
          >
            👤 Профиль
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
