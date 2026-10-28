import { useState, useEffect, useRef } from "react";
import Calendar from "./Calendar";
import ScheduleCard from "./ScheduleCard";
import Greeting from "./Greeting";
import { useAuth } from "../../context/AuthContext";
import { useMaterialData } from "../../hooks/useMaterialData";
import { getWeekType, getDayIndex } from "../../lib/schedule";
import { getResolvedGroup } from "../../lib/group";
import RoomLegend from "./RoomLegend";

// schedule.json — устаревший шаблон (group_A/group_B пустые строки).
// schedule_v2.json содержит реальные объекты { subject, room }; локальная копия
// добавлена в src/data, чтобы оффлайн-фолбэк работал так же, как S3.
const SCHEDULE_FILE = "courses/course-1/semester-1/schedule/schedule_v2.json";

const Home = ({ onNavigate }) => {
  const { profile } = useAuth();
  const {
    data: scheduleData,
    source,
    loading,
  } = useMaterialData(SCHEDULE_FILE);

  const today = new Date();
  const todayIndex = getDayIndex(today);
  const weekType = scheduleData ? getWeekType(today, scheduleData) : null;

  // 🎯 Просматриваемая группа — общая для ScheduleCard и NextLesson
  const profileGroup = getResolvedGroup(profile);
  const [viewGroup, setViewGroup] = useState(profileGroup);

  // Сброс viewGroup при изменении profileGroup
  const lastProfileGroupRef = useRef(profileGroup);
  useEffect(() => {
    if (lastProfileGroupRef.current !== profileGroup) {
      lastProfileGroupRef.current = profileGroup;
      setViewGroup(profileGroup);
    }
  }, [profileGroup]);

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
