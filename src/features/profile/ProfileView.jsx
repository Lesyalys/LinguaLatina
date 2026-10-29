import { useAuth } from "../../context/AuthContext";
import { useGroupPreference } from "../../hooks/useGroupPreference";
import ProfileCard from "./ProfileCard";

const ProfileView = ({ profile, onEdit }) => {
  const { signOut } = useAuth();
  const { group, setGroup } = useGroupPreference();

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

  const bottomBar = (
    <>
      <button
        className="bottom-bar-btn"
        onClick={onEdit}
        title="Редактировать профиль"
      >
        ✏️
      </button>
      <button className="bottom-bar-btn" onClick={handleSignOut} title="Выйти">
        🚪
      </button>
    </>
  );

  return (
    <div className="profile-page">
      <ProfileCard
        profile={profile}
        topButton={topButton}
        bottomBar={bottomBar}
        isOwn={true}
        group={group}
        setGroup={setGroup}
      />
    </div>
  );
};

export default ProfileView;
