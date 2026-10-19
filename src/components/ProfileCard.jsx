const ProfileCard = () => {
  return (
    <div className="card profile-card">
      <div className="profile-avatar" aria-hidden="true">👤</div>
      <div className="profile-info">
        <h2>Иван Иванов</h2>
        <p>Студент-медик • Уровень 1</p>
        <dl className="profile-stats">
          <div>
            <dt>слов выучено</dt>
            <dd>0</dd>
          </div>
          <div>
            <dt>дней подряд</dt>
            <dd>0</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ProfileCard;
