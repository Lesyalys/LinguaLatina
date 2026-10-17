import React from "react";
import { useFilter } from "../../context/FilterContext";

const CourseFilter = () => {
  const {
    courseId,
    semesterId,
    changeCourse,
    setSemesterId,
    availableFilters,
  } = useFilter();

  const currentCourse = availableFilters.find((c) => c.id === courseId);

  return (
    <div className="course-filter">
      <div className="filter-group">
        <label className="filter-label">Курс</label>
        <select
          className="filter-select"
          value={courseId}
          onChange={(e) => changeCourse(e.target.value)}
        >
          {availableFilters.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Семестр</label>
        <select
          className="filter-select"
          value={semesterId}
          onChange={(e) => setSemesterId(e.target.value)}
          disabled={!currentCourse?.semesters.length}
        >
          {currentCourse?.semesters.map((semester) => (
            <option key={semester.id} value={semester.id}>
              {semester.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CourseFilter;
