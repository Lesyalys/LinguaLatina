import React, { useState, useEffect, useMemo } from "react";
import Calendar from "./Calendar";
import ScheduleCard from "./ScheduleCard";
import Greeting from "./Greeting";
import { useAuth } from "../../context/AuthContext";
import { useScheduleContext } from "../../context/ScheduleContext";
import { useScheduleGroup } from "../../hooks/useScheduleGroup";
import {
  getWeekType,
  getDayIndex,
  getScheduleGroups,
  getScheduleByGroup,
} from "../../lib/schedule";

const Home = ({ onNavigate }) => {
  const { user } = useAuth();
  const { scheduleArray = [], loading: scheduleLoading } = useScheduleContext();
  const { scheduleGroup, setScheduleGroup } = useScheduleGroup();

  const availableGroups = getScheduleGroups(scheduleArray);
  const resolvedScheduleGroup = scheduleGroup || availableGroups[0] || null;

  const scheduleData = useMemo(
    () => getScheduleByGroup(scheduleArray, resolvedScheduleGroup),
    [scheduleArray, resolvedScheduleGroup],
  );

  const today = new Date();
  const todayIndex = getDayIndex(today);
  const weekType = scheduleData ? getWeekType(today) : null;

  return (
    <div className="home-page">
      <Greeting
        onLogin={() => onNavigate("profile")}
        scheduleData={scheduleData}
        weekType={weekType}
        dayIndex={todayIndex}
        scheduleGroup={resolvedScheduleGroup}
      />

      <div className="home-grid">
        <div className="home-column">
          <Calendar />
        </div>
        <div className="home-column">
          <ScheduleCard
            data={scheduleData}
            loading={scheduleLoading}
            source={null}
            scheduleGroup={resolvedScheduleGroup}
            availableGroups={availableGroups}
            onScheduleGroupChange={setScheduleGroup}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
