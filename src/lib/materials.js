import manifest from "../data/manifest.json";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const MATERIALS_BUCKET =
  import.meta.env.VITE_SUPABASE_MATERIALS_BUCKET || "materials";

// ============================================================
// Кеш (localStorage, 1 час)
// ============================================================
const CACHE_PREFIX = "materials-cache:";
const CACHE_TTL = 60 * 60 * 1000; // 1 час

const getCacheKey = (dataFile) => `${CACHE_PREFIX}${dataFile}`;

const getCached = (dataFile) => {
  try {
    const raw = localStorage.getItem(getCacheKey(dataFile));
    if (!raw) return null;

    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(getCacheKey(dataFile));
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const setCache = (dataFile, data) => {
  try {
    localStorage.setItem(
      getCacheKey(dataFile),
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  } catch (err) {
    console.warn("[materials] Не удалось закешировать:", err.message);
  }
};

// ============================================================
// Загрузка с S3 + фоллбэк + кеш
// Возвращает: { data, source: "s3" | "cache" | "local" }
// ============================================================
export const loadMaterialData = async (dataFile) => {
  // 1. Проверяем кеш
  const cached = getCached(dataFile);
  if (cached) {
    return { data: cached, source: "cache" };
  }

  // 2. Пытаемся загрузить с S3
  try {
    const url = `${SUPABASE_URL}/storage/v1/object/public/${MATERIALS_BUCKET}/${dataFile}`;
    const res = await fetch(url, { cache: "no-cache" });

    if (res.ok) {
      const data = await res.json();
      setCache(dataFile, data);
      return { data, source: "s3" };
    }

    console.warn(
      `[materials] S3 ответил ${res.status} для ${dataFile}, пробуем локально`,
    );
  } catch (err) {
    console.warn(`[materials] S3 недоступен для ${dataFile}:`, err.message);
  }

  // 3. Fallback — локальный JSON
  try {
    const module = await import(`../data/${dataFile}`);
    return { data: module.default, source: "local" };
  } catch (err) {
    console.error(`[materials] Не удалось загрузить ${dataFile}:`, err);
    return { data: null, source: "error" };
  }
};

// ============================================================
// Очистка кеша (можно вызвать вручную)
// ============================================================
export const clearMaterialsCache = () => {
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith(CACHE_PREFIX),
  );
  keys.forEach((k) => localStorage.removeItem(k));
};

// ============================================================
// Manifest / Subjects / Filters — без изменений
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
