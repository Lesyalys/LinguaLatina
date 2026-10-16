import React from "react";

const ProfileCard = () => {
  return (
    <div className="card profile-card">
      <div className="profile-avatar">👤</div>
      <div className="profile-info">
        <h2>Иван Иванов</h2>
        <p>Студент-медик • Уровень 1</p>
        <div className="profile-stats">
          <div>
            <strong>0</strong>
            <span>дней подряд</span>
          </div>
          <div>
            <strong>0</strong>
            <span>слов выучено</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
