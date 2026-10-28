import {
  getInitials,
  formatMemberSince,
  calcExpPercent,
  countWordsLearned,
} from "../../lib/profileUtils";
import GroupSwitcher from "../../components/ui/GroupSwitcher";
import ActivityGrid from "./ActivityGrid";

const ProfileCard = ({
  profile,
  topButton,
  online = false,
  achievements = [],
  isOwn = false,
  group = "A",
  setGroup,
}) => {
  if (!profile) return null;

  const initials = getInitials(profile);
  const memberSince = formatMemberSince(profile.created_at);
  const wordsLearned = countWordsLearned(profile.progress);
  const expPercent = calcExpPercent(wordsLearned);

  const displayGroup = isOwn ? group : profile.group === "B" ? "B" : "A";

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

      {/* 🎯 Подгруппа */}
      <div className="profile-group-switch">
        {isOwn ? (
          <GroupSwitcher group={group} onChange={setGroup} />
        ) : (
          <div className="profile-group-view">
            <span className="profile-group-label">Группа:</span>
            <span className="profile-group-badge">{displayGroup}</span>
          </div>
        )}
      </div>
      <ActivityGrid history={profile?.progress?.history || []} />

      <ProfileAchievements achievements={achievements} />
    </div>
  );
};

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
