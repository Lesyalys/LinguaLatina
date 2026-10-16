import React from "react";
import { useAuth } from "../../context/AuthContext";

const ProfileView = ({ profile, onEdit }) => {
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

  // Прогресс опыта: считаем от цели (например, 1000 слов = 100%)
  const wordsLearned = profile.progress?.wordsLearned || 0;
  const expTarget = 1000;
  const expPercent = Math.min(
    100,
    Math.round((wordsLearned / expTarget) * 100),
  );

  return (
    <div className="profile-page">
      <div className="profile-view-card">
        {/* Обложка */}
        <div
          className="profile-cover"
          style={
            profile.cover_url
              ? { backgroundImage: `url(${profile.cover_url})` }
              : undefined
          }
        >
          <button className="profile-follow-btn" onClick={onEdit}>
            Редактировать <span className="plus">✏️</span>
          </button>
          <div className="profile-cover-overlay" />
        </div>

        {/* Аватар + прогресс */}
        <div className="profile-view-body">
          <div className="profile-avatar-large">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="profile-progress-bar">
            <span className="progress-label">exp.</span>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Имя, био, мета */}
        <div className="profile-view-info">
          <h2>{profile.display_name || profile.username}</h2>
          <p className="profile-username">@{profile.username}</p>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          <p className="profile-meta">На платформе с {memberSince}</p>
        </div>

        {/* Статистика */}
        <div className="profile-stats-row">
          <div className="profile-stat">
            <strong>{profile.progress?.wordsLearned || 0}</strong>
            <span>Слов</span>
          </div>
          <div className="profile-stat">
            <strong>{profile.progress?.streak || 0}</strong>
            <span>Дней подряд</span>
          </div>
          <div className="profile-stat">
            <strong>
              {
                Object.values(profile.progress?.groups || {}).filter(
                  (g) => g.completed,
                ).length
              }
              /3
            </strong>
            <span>Минимумов</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
