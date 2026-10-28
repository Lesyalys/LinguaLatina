import React, { useState, useEffect } from "react";
import Calendar from "./Calendar";
import ScheduleCard from "./ScheduleCard";
import Greeting from "./Greeting";
import { useAuth } from "../../context/AuthContext";
import { loadMaterialData } from "../../lib/materials";
import { getWeekType, getDayIndex } from "../../lib/schedule";
import { getResolvedGroup } from "../../lib/group";
import RoomLegend from "./RoomLegend";

const SCHEDULE_FILE = "courses/course-1/semester-1/schedule/schedule_v2.json";

const Home = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(null);

  const today = new Date();
  const todayIndex = getDayIndex(today);
  const weekType = scheduleData ? getWeekType(today, scheduleData) : null;

  // 🎯 Просматриваемая группа — общая для ScheduleCard и NextLesson
  const profileGroup = getResolvedGroup(profile);
  const [viewGroup, setViewGroup] = useState(profileGroup);

  // Сброс viewGroup при изменении profileGroup
  const lastProfileGroupRef = React.useRef(profileGroup);
  useEffect(() => {
    if (lastProfileGroupRef.current !== profileGroup) {
      lastProfileGroupRef.current = profileGroup;
      setViewGroup(profileGroup);
    }
  }, [profileGroup]);

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
        viewGroup={viewGroup} // ← передаём в NextLesson
      />

      <div className="home-grid">
        <div className="home-column">
          <Calendar />
        </div>
        <div className="home-column">
          <ScheduleCard
            data={scheduleData}
            loading={loading}
            source={source}
            viewGroup={viewGroup} // ← управляемый
            onViewGroupChange={setViewGroup} // ← callback
            profileGroup={profileGroup} // ← для сравнения
          />
        </div>
        <RoomLegend />
      </div>
    </div>
  );
};

export default Home;
