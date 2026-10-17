import React, { createContext, useContext, useState, useEffect } from "react";
import { getAvailableFilters } from "../lib/materials";

const FilterContext = createContext(null);

export const FilterProvider = ({ children }) => {
  const availableFilters = getAvailableFilters();

  // Выбранный курс — по умолчанию первый
  const [courseId, setCourseId] = useState(
    () =>
      localStorage.getItem("filter-course") ||
      availableFilters[0]?.id ||
      "course-1",
  );

  // Выбранный семестр — по умолчанию первый семестр выбранного курса
  const [semesterId, setSemesterId] = useState(() => {
    const saved = localStorage.getItem("filter-semester");
    if (saved) return saved;
    const course = availableFilters.find((c) => c.id === courseId);
    return course?.semesters[0]?.id || "semester-1";
  });

  // Синхронизация с localStorage
  useEffect(() => {
    localStorage.setItem("filter-course", courseId);
  }, [courseId]);

  useEffect(() => {
    localStorage.setItem("filter-semester", semesterId);
  }, [semesterId]);

  // При смене курса — переключаем семестр на первый доступный
  const changeCourse = (newCourseId) => {
    setCourseId(newCourseId);
    const course = availableFilters.find((c) => c.id === newCourseId);
    setSemesterId(course?.semesters[0]?.id || "semester-1");
  };

  const value = {
    courseId,
    semesterId,
    setSemesterId,
    changeCourse,
    availableFilters,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

export const useFilter = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter must be used within FilterProvider");
  return ctx;
};
