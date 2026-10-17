import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useIncomingRequestsCount } from "../../hooks/useIncomingRequestsCount";
import InstallPWAButton from "../ui/InstallPWAButton";

const Sidebar = ({ currentScreen, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const incomingCount = useIncomingRequestsCount(user?.id);

  // Состояние раскрытия вложенных меню
  const [expanded, setExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebar-expanded");
      return saved ? JSON.parse(saved) : { latin: true }; // «Латинский» раскрыт по умолчанию
    } catch {
      return { latin: true };
    }
  });

  // Автоматически раскрываем «Латинский»,
  // если активный экран относится к словарю/тренировке
  useEffect(() => {
    if (
      ["wordList", "trainingSetup", "trainingCards"].includes(currentScreen)
    ) {
      setExpanded((prev) => ({ ...prev, latin: true }));
    }
  }, [currentScreen]);

  // Сохраняем состояние в localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-expanded", JSON.stringify(expanded));
  }, [expanded]);

  const toggleSection = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNavigate = (screen) => {
    onNavigate(screen);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    if (window.confirm("Выйти из аккаунта?")) {
      await signOut();
      onNavigate("home");
    }
  };

  // ============================================================
  // Пункты меню
  // ============================================================
  const isLatinActive = ["wordList", "trainingSetup", "trainingCards"].includes(
    currentScreen,
  );

  return (
    <>
      <button
        className="burger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Меню"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Medic SurGu</h2>
        </div>

        <nav className="sidebar-nav">
          {/* Главная */}
          <button
            className={`sidebar-item ${
              currentScreen === "home" ? "active" : ""
            }`}
            onClick={() => handleNavigate("home")}
          >
            🏠 Главная
          </button>

          {/* Латинский (аккордеон) */}
          <div className="sidebar-group">
            <button
              className={`sidebar-item sidebar-group-header ${
                isLatinActive ? "active-parent" : ""
              }`}
              onClick={() => toggleSection("latin")}
            >
              <span>📚 Латинский</span>
              <span
                className={`sidebar-chevron ${expanded.latin ? "open" : ""}`}
              >
                ▸
              </span>
            </button>

            <div className={`sidebar-submenu ${expanded.latin ? "open" : ""}`}>
              <button
                className={`sidebar-item sidebar-subitem ${
                  currentScreen === "wordList" ? "active" : ""
                }`}
                onClick={() => handleNavigate("wordList")}
              >
                📖 Словарь
              </button>

              <button
                className={`sidebar-item sidebar-subitem ${
                  ["trainingSetup", "trainingCards"].includes(currentScreen)
                    ? "active"
                    : ""
                } ${!user ? "locked" : ""}`}
                onClick={() => handleNavigate("trainingSetup")}
              >
                🧠 Тренировка
                {!user && <span className="lock-icon">🔒</span>}
              </button>
            </div>
          </div>

          {/* Экзамен (аккордеон) */}
          <div className="sidebar-group">
            <button
              className={`sidebar-item sidebar-group-header ${
                ["examSubjects", "anatomyTickets"].includes(currentScreen)
                  ? "active-parent"
                  : ""
              }`}
              onClick={() => toggleSection("exam")}
            >
              <span>🎓 Экзамен</span>
              <span
                className={`sidebar-chevron ${expanded.exam ? "open" : ""}`}
              >
                ▸
              </span>
            </button>

            <div className={`sidebar-submenu ${expanded.exam ? "open" : ""}`}>
              <button
                className={`sidebar-item sidebar-subitem ${
                  ["examSubjects", "anatomyTickets"].includes(currentScreen)
                    ? "active"
                    : ""
                }`}
                onClick={() => handleNavigate("examSubjects")}
              >
                📚 Предметы
              </button>
            </div>
          </div>

          {/* Друзья */}
          <button
            className={`sidebar-item ${
              currentScreen === "friends" ? "active" : ""
            }`}
            onClick={() => handleNavigate("friends")}
          >
            👥 Друзья
            {incomingCount > 0 && (
              <span className="sidebar-badge">{incomingCount}</span>
            )}
          </button>
        </nav>

        <div className="sidebar-footer">
          <InstallPWAButton />

          {user ? (
            <>
              <button
                className={`sidebar-item profile-link ${
                  currentScreen === "profile" ? "active" : ""
                }`}
                onClick={() => handleNavigate("profile")}
              >
                <span className="sidebar-avatar">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" />
                  ) : (
                    "👤"
                  )}
                </span>
                <span className="sidebar-username">
                  {profile?.display_name || profile?.username || "Профиль"}
                </span>
              </button>

              <button
                className="sidebar-item signout-btn"
                onClick={handleSignOut}
              >
                🚪 Выйти
              </button>
            </>
          ) : (
            <button
              className={`sidebar-item profile-link ${
                currentScreen === "profile" ? "active" : ""
              }`}
              onClick={() => handleNavigate("profile")}
            >
              <span className="sidebar-avatar">👤</span>
              <span className="sidebar-username">Войти</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
