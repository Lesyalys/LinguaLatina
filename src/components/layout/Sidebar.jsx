import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useIncomingRequestsCount } from "../../hooks/useIncomingRequestsCount";
import InstallPWAButton from "../ui/InstallPWAButton";
import ThemeToggle from "../ui/ThemeToggle";

const Sidebar = ({ currentScreen, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const incomingCount = useIncomingRequestsCount(user?.id);

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
          <h2>Lingua Latina</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${isActive(item) ? "active" : ""}`}
              onClick={() => handleNavigate(item.id)}
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
