import React from "react";
import ProfileCard from "./ProfileCard";
import Calendar from "./Calendar";
import CourseProgress from "./CourseProgress";
import WelcomeHero from "./WelcomeHero";
import { useAuth } from "../context/AuthContext";
import Greeting from "./Greeting";

const Home = ({ onNavigate }) => {
  const { user } = useAuth();

  // Если пользователь не авторизован — показываем приветствие
  if (!user) {
    return (
      <WelcomeHero
        onLogin={() => onNavigate("profile")}
        onOpenDictionary={() => onNavigate("wordList")}
      />
    );
  }

  // Авторизованный пользователь видит личный кабинет
  return (
    <div className="home-page">
      <Greeting />
      <div className="home-grid">
        <div className="home-column">
          {/* <ProfileCard onEdit={() => onNavigate("profile")} /> */}
          <Calendar />
        </div>
        <div className="home-column">
          <CourseProgress />
        </div>
      </div>
    </div>
  );
};

export default Home;
