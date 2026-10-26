import React, { useState, useEffect } from "react";
import Calendar from "./Calendar";
import ScheduleCard from "./ScheduleCard";
import Greeting from "./Greeting";
import { useAuth } from "../../context/AuthContext";
import { loadMaterialData } from "../../lib/materials";
import { getWeekType, getDayIndex } from "../../lib/schedule";
import RoomLegend from "./RoomLegend";
import GuestFeatures from "../auth/GuestFeatures";

const SCHEDULE_FILE = "courses/course-1/semester-1/schedule/schedule_v2.json";

const Home = ({ onNavigate }) => {
  const { user } = useAuth();
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(null);

  const today = new Date();
  const todayIndex = getDayIndex(today);
  const weekType = scheduleData ? getWeekType(today, scheduleData) : null;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadMaterialData(SCHEDULE_FILE).then(({ data, source }) => {
      if (!cancelled) {
        setScheduleData(data);
        setSource(source);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home-page">
      <Greeting
        onLogin={() => onNavigate("profile")}
        scheduleData={scheduleData}
        weekType={weekType}
        dayIndex={todayIndex}
      />
      <div className="home-grid">
        {!user && <GuestFeatures onLogin={() => onNavigate("profile")} />}
        <div className="home-column">
          <Calendar />
        </div>
        <div className="home-column">
          <ScheduleCard data={scheduleData} loading={loading} source={source} />
        </div>
        <div className="home-column">
          <RoomLegend />
        </div>
      </div>
    </div>
  );
};

export default Home;
