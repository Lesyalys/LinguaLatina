// src/components/profile/ProfileCard.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getInitials,
  formatMemberSince,
  calcExpPercent,
} from "../../lib/profileUtils";

/**
 * Презентационный компонент карточки профиля.
 *
 * Props:
 *  - profile: объект профиля
 *  - topButton: ReactNode — кнопка в правом верхнем углу обложки
 *  - online?: boolean — показывать ли индикатор онлайна
 *  - bottomBar?: ReactNode — нижняя панель действий
 *  - achievements?: Array — список достижений (пока заглушка)
 */
const ProfileCard = ({
  profile,
  topButton,
  online = false,
  bottomBar,
  achievements = [],
}) => {
  const { updateProfile } = useAuth();
  const [savingGroup, setSavingGroup] = useState(false);

  if (!profile) return null;

  const currentGroup = profile.group || "A";

  const handleGroupChange = async (newGroup) => {
    if (newGroup === currentGroup) return;
    setSavingGroup(true);
    try {
      await updateProfile({ group: newGroup });
    } catch (err) {
      alert("Не удалось сохранить подгруппу: " + (err.message || err));
    } finally {
      setSavingGroup(false);
    }
  };

  const initials = getInitials(profile);
  const memberSince = formatMemberSince(profile.created_at);
  const wordsLearned = profile.progress?.wordsLearned || 0;
  const expPercent = calcExpPercent(wordsLearned);

  return (
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
        {topButton}
        <div className="profile-cover-overlay" />
      </div>

      {/* Аватар + прогресс */}
      <div className="profile-view-body">
        <div className="profile-avatar-large">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} />
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
        <p className="profile-username">
          @{profile.username}
          {online && <span className="online-indicator">● онлайн</span>}
        </p>
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        <p className="profile-meta">На платформе с {memberSince}</p>
      </div>

      {/* 🎯 Переключатель подгруппы */}
      <div className="profile-group-switch">
        <span className="profile-group-label">Моя подгруппа:</span>
        <div className="profile-group-buttons">
          <button
            type="button"
            className={`group-btn ${currentGroup === "A" ? "active" : ""}`}
            onClick={() => handleGroupChange("A")}
            disabled={savingGroup}
          >
            Группа A
          </button>
          <button
            type="button"
            className={`group-btn ${currentGroup === "B" ? "active" : ""}`}
            onClick={() => handleGroupChange("B")}
            disabled={savingGroup}
          >
            Группа B
          </button>
        </div>
      </div>

      {/* Достижения (заглушка) */}
      <ProfileAchievements achievements={achievements} />

      {/* Нижняя панель (опционально) */}
      {bottomBar && <div className="profile-bottom-bar">{bottomBar}</div>}
    </div>
  );
};

/**
 * Блок достижений. Пока заглушка.
 */
const ProfileAchievements = ({ achievements }) => {
  return (
    <div className="profile-achievements">
      <div className="profile-achievements-header">
        <h3>Достижения</h3>
        <span className="profile-achievements-count">
          {achievements.length}
        </span>
      </div>

      {achievements.length === 0 ? (
        <div className="profile-achievements-empty">
          <span className="profile-achievements-empty-icon">🏅</span>
          <p>Пока нет достижений</p>
          <small>Здесь появятся бейджи за прогресс в обучении</small>
        </div>
      ) : (
        <div className="profile-achievements-grid">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`profile-achievement-badge${
                ach.unlocked ? "" : " locked"
              }`}
              title={ach.description || ach.title}
            >
              <span className="achievement-icon">{ach.icon || "🏅"}</span>
              <span className="achievement-title">{ach.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
