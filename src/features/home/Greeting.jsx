import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../lib/profileUtils";
import NextLesson from "./NextLesson";

const greetingByHour = (hour) => {
  if (hour < 6) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
};

const Greeting = ({ onLogin, scheduleData, weekType, dayIndex, viewGroup }) => {
  const { profile, user } = useAuth();

  const greeting = greetingByHour(new Date().getHours());

  if (!user || !profile) {
    return (
      <div className="greeting guest">
        <div className="greeting-avatar guest-avatar"></div>
        <div className="greeting-text">
          <h1 className="greeting-title">
            Добро пожаловать в{" "}
            <span className="greeting-name">Lingua Latina</span>!
          </h1>
          <p className="greeting-username">
            Платформа для изучения латыни и подготовки к экзаменам
          </p>
          <p className="greeting-subtitle">
            Откройте материалы или войдите, чтобы начать тренировку.
          </p>
          <button className="greeting-login-btn" onClick={onLogin}>
            👤 Войти / Зарегистрироваться
          </button>
        </div>
      </div>
    );
  }

  const name = profile.display_name || profile.username;
  const initials = getInitials(profile);

  const hasSchedule =
    scheduleData && weekType && dayIndex !== null && dayIndex !== undefined;

  return (
    <div className="greeting">
      <div className="greeting-avatar">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={name} />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      <div className="greeting-text">
        <h1 className="greeting-title">
          {greeting}, <span className="greeting-name">{name}</span>!
        </h1>
        <p className="greeting-username">@{profile.username}</p>
        <p className="greeting-subtitle">
          Продолжай учиться — каждый день приближает тебя к цели.
        </p>
      </div>

      {hasSchedule && (
        <NextLesson
          scheduleData={scheduleData}
          weekType={weekType}
          dayIndex={dayIndex}
          viewGroup={viewGroup}
        />
      )}
    </div>
  );
};

export default Greeting;
