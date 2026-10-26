import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useIncomingRequestsCount } from "../../hooks/useIncomingRequestsCount";
import { useSwipe } from "../../hooks/useSwipe";
import InstallPWAButton from "../ui/InstallPWAButton";
import ThemeToggle from "../ui/ThemeToggle";

const Sidebar = ({ currentScreen, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "1";
  });

  const { user, profile, signOut } = useAuth();
  const incomingCount = useIncomingRequestsCount(user?.id);

  // 📱 Свайпы (только на мобильном)
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  useSwipe({
    enabled: isMobile,
    onSwipeRight: () => {
      if (!isOpen) setIsOpen(true);
    },
    onSwipeLeft: () => {
      if (isOpen) setIsOpen(false);
    },
  });

  // 💾 Сохраняем состояние collapsed
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed ? "1" : "0");
    document.documentElement.classList.toggle("sidebar-collapsed", collapsed);
  }, [collapsed]);

  const menuItems = [
    { id: "home", label: "🏠 Главная", activeFor: ["home"] },
    {
      id: "materials",
      label: "📚 Материалы",
      activeFor: [
        "materials",
        "subjectActions",
        "examSubjectActions",
        "wordList",
        "trainingSetup",
        "trainingCards",
        "anatomyTickets",
        "examQuiz",
      ],
    },
    ...(user
      ? [
          {
            id: "games",
            label: "🎮 Игра вдвоём",
            activeFor: ["games"],
          },
        ]
      : []),
    ...(user
      ? [
          {
            id: "friends",
            label: "👥 Друзья",
            activeFor: ["friends"],
            badge: incomingCount,
          },
        ]
      : []),
  ];

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

  const isActive = (item) => item.activeFor.includes(currentScreen);

  return (
    <>
      {/* Бургер — только на мобильном */}
      <button
        className="burger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Меню"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* ПК: кнопка «Свернуть / Развернуть» */}
      <button
        className="sidebar-collapse-btn"
        onClick={() => setCollapsed((v) => !v)}
        title={collapsed ? "Развернуть меню" : "Свернуть меню"}
        aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
      >
        {collapsed ? "»" : "«"}
      </button>

      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`sidebar ${isOpen ? "open" : ""} ${
          collapsed ? "collapsed" : ""
        }`}
      >
        <div className="sidebar-header">
          <h2>Medic</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${isActive(item) ? "active" : ""}`}
              onClick={() => handleNavigate(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <span>{item.label}</span>
              <span className="sidebar-item-right">
                {item.badge > 0 && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <InstallPWAButton />
          <ThemeToggle />

          {user ? (
            <>
              <button
                className={`sidebar-item profile-link ${
                  currentScreen === "profile" ? "active" : ""
                }`}
                onClick={() => handleNavigate("profile")}
                title={collapsed ? "Профиль" : undefined}
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
                title={collapsed ? "Выйти" : undefined}
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
              title={collapsed ? "Войти" : undefined}
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
