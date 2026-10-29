// src/components/profile/ProfileCard.jsx
import React from "react";
import {
  getInitials,
  formatMemberSince,
  calcExpPercent,
} from "../../lib/profileUtils";
import { useAuth } from "../../context/AuthContext";
import GroupSwitcher from "../../components/ui/GroupSwitcher";
// import SeasonFilter from "../../components/ui/SeasonFilter";
import ActivityGrid from "./ActivityGrid";
import { useScheduleGroup } from "../../hooks/useScheduleGroup";

// ============================================================
// Подсчёт выученных слов по всем курсам/семестрам/предметам
// (progress.courses[courseId].semesters[semId].subjects[subjId])
// ============================================================
const countWordsLearned = (progress) => {
  if (!progress?.courses) return 0;
  let total = 0;

  Object.values(progress.courses).forEach((course) => {
    Object.values(course?.semesters || {}).forEach((semester) => {
      Object.values(semester?.subjects || {}).forEach((subject) => {
        if (Array.isArray(subject?.wordsLearned)) {
          total += subject.wordsLearned.length;
        }
        if (Array.isArray(subject?.quizLearned)) {
          total += subject.quizLearned.length;
        }
      });
    });
  });

  return total;
};

const ProfileCard = ({
  profile,
  topButton,
  online = false,
  achievements = [],
  isOwn = false,
  group = "A",
  setGroup,
}) => {
  const { user } = useAuth();
  const {
    scheduleGroup,
    setScheduleGroup,
    hasGroups,
    courseId,
    season,
    availableGroups = [], // 🎯 получаем из хука
    loading: scheduleLoading,
  } = useScheduleGroup();

  if (!profile) return null;

  const initials = getInitials(profile);
  const memberSince = formatMemberSince(profile.created_at);
  const wordsLearned = countWordsLearned(profile.progress);
  const expPercent = calcExpPercent(wordsLearned);

  const displayGroup = isOwn ? group : profile.group === "B" ? "B" : "A";

  return (
    <div className="profile-view-card">
      {/* ======================================================
          Обложка профиля
         ====================================================== */}
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

      {/* ======================================================
          Аватар + прогресс
         ====================================================== */}
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

      {/* ======================================================
          Имя, ник, био, мета
         ====================================================== */}
      <div className="profile-view-info">
        <h2>{profile.display_name || profile.username}</h2>
        <p className="profile-username">
          @{profile.username}
          {online && <span className="online-indicator">● онлайн</span>}
        </p>
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        <p className="profile-meta">На платформе с {memberSince}</p>
      </div>

      {/* ======================================================
          🎯 Учебная группа (только для своего профиля)
         ====================================================== */}
      {isOwn && (
        <div className="profile-schedule-group">
          <label className="profile-schedule-group__label">
            Учебная группа
          </label>

          {scheduleLoading || availableGroups.length === 0 ? (
            <span className="profile-schedule-group__placeholder">
              Загрузка...
            </span>
          ) : (
            <select
              className="profile-schedule-group__select"
              value={scheduleGroup || ""}
              onChange={(e) => setScheduleGroup(e.target.value)}
            >
              {availableGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* ======================================================
          🎯 Семестр (Осень / Зима) — только для своего профиля
         ====================================================== */}
      {/* {isOwn && (
        <div className="profile-season-switch">
          <SeasonFilter />
        </div>
      )} */}

      {/* ======================================================
          🎯 Подгруппа (A/B) — только если у группы есть подгруппы
         ====================================================== */}
      {hasGroups ? (
        <div className="profile-group-switch">
          {isOwn ? (
            <GroupSwitcher group={group} onChange={setGroup} />
          ) : (
            <div className="profile-group-view">
              <span className="profile-group-label">Подгруппа:</span>
              <span className="profile-group-badge">{displayGroup}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="profile-group-switch profile-group-switch--disabled">
          <span className="profile-group-label">Подгруппа:</span>
          <span className="profile-group-badge profile-group-badge--muted">
            Не требуется
          </span>
          <span className="profile-group-hint">
            У этой группы нет деления на подгруппы
          </span>
        </div>
      )}

      {/* ======================================================
          📊 Активность (GitHub-like)
         ====================================================== */}
      <ActivityGrid history={profile?.progress?.history || []} />

      {/* ======================================================
          🏅 Достижения
         ====================================================== */}
      <ProfileAchievements achievements={achievements} />
    </div>
  );
};

// ============================================================
// Достижения — заглушка
// ============================================================
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
