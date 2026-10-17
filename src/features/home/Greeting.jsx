// src/components/Greeting.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";

const Greeting = () => {
  const { profile } = useAuth();
  if (!profile) return null;

  // Приветствие по времени суток
  const hour = new Date().getHours();
  let greeting = "Добрый день";
  if (hour < 6) greeting = "Доброй ночи";
  else if (hour < 12) greeting = "Доброе утро";
  else if (hour < 18) greeting = "Добрый день";
  else greeting = "Добрый вечер";

  const name = profile.display_name || profile.username;

  // Инициалы для аватара-заглушки
  const initials = (profile.display_name || profile.username || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
    </div>
  );
};

export default Greeting;
