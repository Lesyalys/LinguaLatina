// src/components/profile/ProfileView.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileCard from "./ProfileCard";

const ProfileView = ({ profile, onEdit }) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    if (window.confirm("Выйти из аккаунта?")) {
      await signOut();
    }
  };

  const topButton = (
    <button className="profile-follow-btn" onClick={onEdit}>
      Редактировать <span className="plus">✏️</span>
    </button>
  );

  return (
    <div className="profile-page">
      <ProfileCard profile={profile} topButton={topButton} />
    </div>
  );
};

export default ProfileView;
