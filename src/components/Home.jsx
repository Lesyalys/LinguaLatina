import React from "react";
import ProfileCard from "./ProfileCard";
import Calendar from "./Calendar";
import CourseProgress from "./CourseProgress";

const Home = () => {
  return (
    <div className="home-page">
      <h1 className="page-title">Главная</h1>

      <div className="home-grid">
        <div className="home-column">
          <ProfileCard />
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
