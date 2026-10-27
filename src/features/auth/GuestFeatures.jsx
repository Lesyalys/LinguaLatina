import React from "react";

const FEATURES = [
  {
    icon: "🧠",
    title: "Тренировка слов",
    description:
      "Карточки с самооценкой, чтобы запоминать латинские термины и не забывать их.",
    accent: "#8b9cff",
  },
  {
    icon: "🎯",
    title: "Тесты по билетам",
    description:
      "Проверь себя по билетам анатомии: тесты с вариантами ответов и пояснениями.",
    accent: "#f472b6",
  },
  {
    icon: "📊",
    title: "Прогресс и статистика",
    description:
      "Следи за количеством выученных слов и вопросов, отслеживай прогресс по курсу.",
    accent: "#34d399",
  },
  {
    icon: "🎮",
    title: "Игра вдвоём",
    description:
      "Соревнуйся с друзьями в дуэлях: кто быстрее переведёт слово на латынь.",
    accent: "#fbbf24",
  },
  {
    icon: "👥",
    title: "Друзья",
    description:
      "Добавляй друзей, смотри их прогресс и играй вместе в реальном времени.",
    accent: "#a78bfa",
  },
  {
    icon: "🏅",
    title: "Достижения",
    description:
      "Получай бейджи за прогресс, серии занятий и успехи в тренировках.",
    accent: "#f87171",
  },
];

const GuestFeatures = ({ onLogin }) => {
  return (
    <div className="guest-features">
      <div className="guest-features__header">
        <h2>Что даёт аккаунт</h2>
        <p>Откройте все возможности платформы — это бесплатно</p>
      </div>

      <div className="guest-features__grid">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="guest-feature"
            style={{ "--feature-accent": f.accent }}
          >
            <div className="guest-feature__icon">{f.icon}</div>
            <h3 className="guest-feature__title">{f.title}</h3>
            <p className="guest-feature__desc">{f.description}</p>
          </div>
        ))}
      </div>

      <div className="guest-features__cta">
        <button className="welcome-btn primary" onClick={onLogin}>
          👤 Создать аккаунт / Войти
        </button>
      </div>
    </div>
  );
};

export default GuestFeatures;
