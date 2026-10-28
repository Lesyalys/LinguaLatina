import { useGroupPreference } from "../../hooks/useGroupPreference";
import ProfileCard from "./ProfileCard";

const ProfileView = ({ profile, onEdit }) => {
  // Хук живёт только на экране СВОЕГО профиля — на чужих профилях
  // он не монтируется и не пишет group при unmount.
  const { group, setGroup } = useGroupPreference();

  const topButton = (
    <button className="profile-follow-btn" onClick={onEdit}>
      Редактировать <span className="plus">✏️</span>
    </button>
  );

  return (
    <div className="profile-page">
      <ProfileCard
        profile={profile}
        topButton={topButton}
        isOwn={true}
        group={group}
        setGroup={setGroup}
      />
    </div>
  );
};

export default ProfileView;
