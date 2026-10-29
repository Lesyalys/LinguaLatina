import React, { createContext, useContext, useState, useEffect } from "react";
import { useScheduleGroup } from "../hooks/useScheduleGroup";
import { useScheduleContext } from "./ScheduleContext";

const FilterContext = createContext(null);

// 🎯 Фиксированный список семестров
const ALL_SEASONS = ["Осень", "Зима"];

export const FilterProvider = ({ children }) => {
  const { scheduleArray, loading: scheduleLoading } = useScheduleContext();
  const { courseId, season: groupSeason } = useScheduleGroup();

  // 🎯 season — локальный стейт, НЕ синхронизируется с группой
  // (только стартовое значение — от группы)
  const [season, setSeasonState] = useState(() => {
    const saved = localStorage.getItem("filter-season");
    if (saved && ALL_SEASONS.includes(saved)) return saved;
    return groupSeason && ALL_SEASONS.includes(groupSeason)
      ? groupSeason
      : ALL_SEASONS[0];
  });

  // 🎯 Пользовательский setSeason — обновляет стейт + localStorage
  const setSeason = (newSeason) => {
    if (!ALL_SEASONS.includes(newSeason)) return;
    setSeasonState(newSeason);
    localStorage.setItem("filter-season", newSeason);
  };

  if (scheduleLoading) {
    return <div className="app-loading">Загрузка расписания...</div>;
  }

  return (
    <FilterContext.Provider
      value={{
        courseId, // 🎯 из группы
        season, // 🎯 независимый (Осень / Зима)
        setSeason,
        availableSeasons: ALL_SEASONS,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter must be used within FilterProvider");
  return ctx;
};
