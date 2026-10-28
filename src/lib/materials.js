import manifest from "../data/manifest.json";

// Локальные копии данных (собираются в бандл как обычные ассеты).
// Ключ — путь относительно src/data, значение — URL ассета с хэшем.
const localDataAssets = import.meta.glob("../data/**/*.json", {
  query: "?url",
  import: "default",
  eager: true,
});

const LOCAL_DATA_URLS = Object.entries(localDataAssets).reduce(
  (acc, [globKey, url]) => {
    const idx = globKey.indexOf("/data/");
    if (idx !== -1) acc[globKey.slice(idx + "/data/".length)] = url;
    return acc;
  },
  {},
);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const MATERIALS_BUCKET =
  import.meta.env.VITE_SUPABASE_MATERIALS_BUCKET || "materials";

// ============================================================
// Кеш (localStorage)
// ============================================================
const CACHE_PREFIX = "materials-cache:";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 1 день
const CACHE_STALE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 дней — максимальный срок жизни

const getCacheKey = (dataFile) => `${CACHE_PREFIX}${dataFile}`;

/**
 * Читает кеш и возвращает { data, timestamp, isFresh }.
 * isFresh — true, если кеш моложе TTL (1 день).
 */
const readCache = (dataFile) => {
  try {
    const raw = localStorage.getItem(getCacheKey(dataFile));
    if (!raw) return null;

    const { data, timestamp } = JSON.parse(raw);
    const age = Date.now() - timestamp;

    // Совсем старый — считаем отсутствующим
    if (age > CACHE_STALE_TTL) {
      localStorage.removeItem(getCacheKey(dataFile));
      return null;
    }

    return {
      data,
      timestamp,
      age,
      isFresh: age < CACHE_TTL,
    };
  } catch {
    return null;
  }
};

const writeCache = (dataFile, data) => {
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
// Загрузка
// Возвращает: { data, source: "s3" | "cache" | "cache-stale" | "local" | "error" }
// ============================================================

/**
 * Путь к данным нормализуется в один формате: относительно src/data,
 * без ведущего слэша. Это защищает и от `undefined` в ключе localStorage,
 * и от двойного слэша в URL S3, и от расхождения с ключами LOCAL_DATA_URLS.
 */
const normalizeDataFile = (dataFile) =>
  typeof dataFile === "string" ? dataFile.replace(/^\/+/, "").trim() : "";

export const loadMaterialData = async (rawDataFile) => {
  const dataFile = normalizeDataFile(rawDataFile);

  // Guard: пустой/некорректный путь — не ходим ни в S3, ни в кеш
  if (!dataFile || !dataFile.endsWith(".json")) {
    console.error(
      `[materials] Некорректный путь к данным: ${JSON.stringify(rawDataFile)}`,
    );
    return { data: null, source: "error" };
  }

  const cached = readCache(dataFile);
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  // 1. Свежий кеш + онлайн — отдаём сразу, не дёргаем S3
  if (cached?.isFresh && isOnline) {
    return { data: cached.data, source: "cache" };
  }

  // 2. Офлайн — отдаём кеш (даже устаревший) или локальный fallback
  if (!isOnline) {
    if (cached) {
      return {
        data: cached.data,
        source: cached.isFresh ? "cache" : "cache-stale",
      };
    }
    return loadLocal(dataFile, "offline");
  }

  // 3. Онлайн + кеш устарел (или его нет) — пробуем S3
  try {
    const url = `${SUPABASE_URL}/storage/v1/object/public/${MATERIALS_BUCKET}/${dataFile}`;
    const res = await fetch(url, { cache: "no-cache" });

    if (res.ok) {
      const data = await res.json();
      writeCache(dataFile, data);
      return { data, source: "s3" };
    }

    console.warn(
      `[materials] S3 ответил ${res.status} для ${dataFile}, пробуем кеш/локально`,
    );
  } catch (err) {
    console.warn(`[materials] S3 недоступен для ${dataFile}:`, err.message);
  }

  // 4. S3 упал — пробуем кеш (даже устаревший)
  if (cached) {
    return {
      data: cached.data,
      source: cached.isFresh ? "cache" : "cache-stale",
    };
  }

  // 5. Кеша нет — локальный fallback
  return loadLocal(dataFile, "offline");
};

/**
 * Локальный fallback (если S3 и кеш недоступны).
 * Данные уже собраны в бандл как ассеты, fetch по URL работает через precache SW.
 */
const loadLocal = async (dataFile, reason = "") => {
  const url = LOCAL_DATA_URLS[dataFile];
  if (!url) {
    console.error(
      `[materials] Нет локальной копии для ${dataFile} (${reason})`,
    );
    return { data: null, source: "error" };
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { data: await res.json(), source: "local" };
  } catch (err) {
    console.error(
      `[materials] Не удалось загрузить ${dataFile} локально (${reason}):`,
      err,
    );
    return { data: null, source: "error" };
  }
};

// ============================================================
// Очистка кеша (по кнопке в профиле, например)
// ============================================================
// export const clearMaterialsCache = () => {
//   const keys = Object.keys(localStorage).filter((k) =>
//     k.startsWith(CACHE_PREFIX),
//   );
//   keys.forEach((k) => localStorage.removeItem(k));
// };

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
