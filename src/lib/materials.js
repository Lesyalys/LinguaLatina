import manifest from "../data/manifest.json";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const MATERIALS_BUCKET =
  import.meta.env.VITE_SUPABASE_MATERIALS_BUCKET || "materials";

// ============================================================
// Загрузка материала с S3 (Supabase Storage) с фоллбэком на локальный
// ============================================================
export const loadMaterialData = async (dataFile) => {
  // 🔥 Пытаемся загрузить с S3
  try {
    const url = `${SUPABASE_URL}/storage/v1/object/public/${MATERIALS_BUCKET}/${dataFile}`;
    const res = await fetch(url, {
      // Отключаем кэш браузера, чтобы при обновлении файлов на S3 не было старья
      cache: "no-cache",
    });

    if (res.ok) {
      return await res.json();
    }
    console.warn(
      `[materials] S3 ответил ${res.status} для ${dataFile}, пробуем локально`,
    );
  } catch (err) {
    console.warn(`[materials] S3 недоступен для ${dataFile}:`, err.message);
  }

  // 🏠 Фоллбэк на локальный JSON
  try {
    const module = await import(`../data/${dataFile}`);
    return module.default;
  } catch (err) {
    console.error(`[materials] Не удалось загрузить ${dataFile}:`, err);
    return null;
  }
};

// ============================================================
// Манифест (пока локальный, но легко перевести на S3 аналогично)
// ============================================================
export const getManifest = () => manifest;

export const getCourses = () => manifest.courses;

export const getSemesters = (courseId) => {
  const course = manifest.courses.find((c) => c.id === courseId);
  return course?.semesters || [];
};

export const getSubjects = ({ courseId, semesterId, type } = {}) => {
  const result = [];
  manifest.courses.forEach((course) => {
    if (courseId && course.id !== courseId) return;
    course.semesters.forEach((semester) => {
      if (semesterId && semester.id !== semesterId) return;
      semester.subjects.forEach((subject) => {
        if (type && subject.type !== type) return;
        result.push({
          ...subject,
          courseId: course.id,
          courseTitle: course.title,
          semesterId: semester.id,
          semesterTitle: semester.title,
        });
      });
    });
  });
  return result;
};

export const getSubjectById = ({ courseId, semesterId, subjectId }) => {
  const course = manifest.courses.find((c) => c.id === courseId);
  const semester = course?.semesters.find((s) => s.id === semesterId);
  return semester?.subjects.find((s) => s.id === subjectId) || null;
};

export const getAvailableFilters = () => {
  return manifest.courses.map((course) => ({
    id: course.id,
    title: course.title,
    semesters: course.semesters.map((s) => ({
      id: s.id,
      title: s.title,
      subjectsCount: s.subjects.length,
    })),
  }));
};
