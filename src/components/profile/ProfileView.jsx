import React from "react";
import { useAuth } from "../../context/AuthContext";

const ProfileView = ({ profile, onEdit }) => {
  console.log("🔍 ProfileView render, avatar_url:", profile?.avatar_url);
  console.log("🔍 ProfileView render, cover_url:", profile?.cover_url);
  const { signOut } = useAuth();
  const handleSignOut = async () => {
    if (window.confirm("Выйти из аккаунта?")) {
      await signOut();
    }
  };
  if (!profile) return null;

  const initials = (profile.display_name || profile.username || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = new Date(profile.created_at).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="profile-page">
      <h1 className="page-title">Профиль</h1>

      <div className="profile-view-card">
        {/* Шапка профиля (cover) */}
        <div
          className="profile-cover"
          style={
            profile.cover_url
              ? { backgroundImage: `url(${profile.cover_url})` }
              : undefined
          }
        >
          <div className="profile-cover-overlay" />
        </div>

        {/* Аватар и основная информация */}
        <div className="profile-view-body">
          <div className="profile-avatar-large">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="profile-view-info">
            <h2>{profile.display_name || profile.username}</h2>
            <p className="profile-username">@{profile.username}</p>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <p className="profile-meta">На платформе с {memberSince}</p>
          </div>

          <div className="profile-view-actions">
            <button className="profile-action-btn primary" onClick={onEdit}>
              ✏️ Редактировать
            </button>
            <button
              className="profile-action-btn danger"
              onClick={handleSignOut}
            >
              🚪 Выйти
            </button>
          </div>
        </div>
      </div>

      {/* Прогресс */}
      <div className="profile-progress-card">
        <h3>Прогресс</h3>
        <div className="profile-progress-grid">
          <div className="profile-progress-item">
            <strong>{profile.progress?.streak || 0}</strong>
            <span>🔥 Дней подряд</span>
          </div>
          <div className="profile-progress-item">
            <strong>{profile.progress?.wordsLearned || 0}</strong>
            <span>📚 Слов выучено</span>
          </div>
          <div className="profile-progress-item">
            <strong>
              {
                Object.values(profile.progress?.groups || {}).filter(
                  (g) => g.completed,
                ).length
              }
              /3
            </strong>
            <span>✅ Минимумов пройдено</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
