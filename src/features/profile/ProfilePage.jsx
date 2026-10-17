import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthForm from "../auth/AuthForm";
import ProfileView from "./ProfileView";
import ProfileEdit from "./ProfileEdit";

const ProfilePage = () => {
  const { user, profile, loading } = useAuth();
  const [mode, setMode] = useState("view"); // 'view' | 'edit'

  if (loading) {
    return <div className="page-placeholder">Загрузка...</div>;
  }

  // Не авторизован — показываем форму входа/регистрации
  if (!user) {
    return <AuthForm />;
  }

  // Авторизован — показываем профиль
  if (mode === "edit") {
    return (
      <ProfileEdit
        profile={profile}
        onCancel={() => setMode("view")}
        onSaved={() => setMode("view")}
      />
    );
  }

  return <ProfileView profile={profile} onEdit={() => setMode("edit")} />;
};

export default ProfilePage;
