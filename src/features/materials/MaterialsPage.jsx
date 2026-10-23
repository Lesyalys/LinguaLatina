import React from "react";
import { useFilter } from "../../context/FilterContext";
import { getSubjects } from "../../lib/materials";
import SubjectCard from "../../components/ui/SubjectCard";
import CourseFilter from "../../components/ui/CourseFilter";

const MaterialsPage = ({ onOpenSubject }) => {
  const { courseId, semesterId, availableFilters } = useFilter();

  const materials = getSubjects({ courseId, semesterId });

  const currentCourse = availableFilters.find((c) => c.id === courseId);
  const currentSemester = currentCourse?.semesters.find(
    (s) => s.id === semesterId,
  );

  const totalCount = materials.length;

  return (
    <div className="materials-page">
      <div className="materials-header">
        <div>
          <h1 className="page-title">Материалы</h1>
          <p className="page-subtitle">
            {currentCourse?.title} • {currentSemester?.title}
            {totalCount > 0 && ` • ${totalCount} предметов`}
          </p>
        </div>

        {/* 🎯 Фильтр курса/семестра внутри страницы */}
        <CourseFilter variant="inline" />
      </div>

      {totalCount === 0 ? (
        <div className="no-results">
          <p>В этом семестре пока нет материалов</p>
        </div>
      ) : (
        <div className="subjects-grid">
          {materials.map((material) => (
            <SubjectCard
              key={material.id}
              subject={material}
              onOpen={() => onOpenSubject(material)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialsPage;
