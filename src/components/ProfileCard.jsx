import React from "react";
import { useAuth } from "../context/AuthContext";

const ProfileCard = ({ onEdit }) => {
  const { profile } = useAuth();
  if (!profile) return null;

  const initials = (profile.display_name || profile.username || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const streak = profile.progress?.streak || 0;
  const wordsLearned = profile.progress?.wordsLearned || 0;

  return (
    <div className="card profile-card">
      <div className="profile-avatar">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className="profile-info">
        <h2>{profile.display_name || profile.username}</h2>
        <p>@{profile.username}</p>
        <div className="profile-stats">
          <div>
            <strong>{streak}</strong>
            <span>🔥 Дней подряд</span>
          </div>
          <div>
            <strong>{wordsLearned}</strong>
            <span>📚 Слов выучено</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
