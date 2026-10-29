import React, { useState, useEffect } from "react";
import { useFilter } from "../../context/FilterContext";
import { loadAndEnrichManifest } from "../../lib/materials";
import SubjectCard from "../../components/ui/SubjectCard";
import SeasonFilter from "../../components/ui/SeasonFilter";
import DataWarning from "../../components/ui/DataWarning";

const MaterialsPage = ({ onOpenSubject }) => {
  // 🎯 courseId — из группы, season — из фильтра
  const { courseId, season } = useFilter();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // 🎯 Путь: course-N/season-{autumn|winter}/manifest.json
    loadAndEnrichManifest({ courseId, season }).then(({ subjects, source }) => {
      if (cancelled) return;
      setSubjects(subjects);
      setSource(source);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [courseId, season]);

  if (loading) return <div className="app-loading">Загрузка...</div>;

  return (
    <div className="materials-page">
      <div className="materials-header">
        <div>
          <h1 className="page-title">Материалы</h1>
          <p className="page-subtitle">
            {courseId.replace("course-", "")} курс • {season}
          </p>
        </div>

        {/* 🎯 Фильтр семестра */}
        <SeasonFilter />
      </div>

      <DataWarning source={source} />

      {subjects.length === 0 ? (
        <div className="no-results">
          <p>В семестре «{season}» пока нет материалов</p>
        </div>
      ) : (
        <div className="subjects-grid">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onOpen={() => onOpenSubject(subject)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialsPage;
