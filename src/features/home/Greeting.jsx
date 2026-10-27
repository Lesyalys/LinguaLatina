import React from "react";
import { useAuth } from "../../context/AuthContext";
import NextLesson from "./NextLesson";

const Greeting = ({ onLogin, scheduleData, weekType, dayIndex }) => {
  const { profile, user } = useAuth();

  const hour = new Date().getHours();
  let greeting = "Добрый день";
  if (hour < 6) greeting = "Доброй ночи";
  else if (hour < 12) greeting = "Доброе утро";
  else if (hour < 18) greeting = "Добрый день";
  else greeting = "Добрый вечер";

  // 👤 Гость
  if (!user || !profile) {
    return (
      <div className="greeting guest">
        <div className="greeting-avatar guest-avatar">👋</div>
        <div className="greeting-text">
          <h1 className="greeting-title">
            Добро пожаловать в <span className="greeting-name">Medicat</span>!
          </h1>
          <p className="greeting-username">
            Платформа для удобного изучения материалов
          </p>
          <p className="greeting-subtitle">
            Откройте материалы или войдите, чтобы начать тренировку.
          </p>
        </div>
      </div>
    );
  }

  // 👤 Авторизован
  const name = profile.display_name || profile.username;
  const initials = (profile.display_name || profile.username || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
          {greeting}, <span className="greeting-name">{name}</span>! 👋
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
        />
      )}
    </div>
  );
};

export default Greeting;
