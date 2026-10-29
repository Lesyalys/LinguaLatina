// ============================================================
// Материалы: только S3 + localStorage-кэш
// ============================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const MATERIALS_BUCKET =
  import.meta.env.VITE_SUPABASE_MATERIALS_BUCKET || "materials";

// ============================================================
// Кэш (localStorage)
// ============================================================
const CACHE_PREFIX = "materials-cache:";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 1 день — обновляем раз в сутки
const CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 дней — совсем старый удаляем

const getCacheKey = (dataFile) => `${CACHE_PREFIX}${dataFile}`;

/**
 * Читает кэш.
 * Возвращает { data, timestamp, age, isFresh } или null.
 */
const readCache = (dataFile) => {
  try {
    const raw = localStorage.getItem(getCacheKey(dataFile));
    if (!raw) return null;

    const { data, timestamp } = JSON.parse(raw);
    const age = Date.now() - timestamp;

    // Совсем старый — удаляем
    if (age > CACHE_MAX_AGE) {
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
// Нормализация пути
// ============================================================
const normalizeDataFile = (dataFile) =>
  typeof dataFile === "string" ? dataFile.replace(/^\/+/, "").trim() : "";

// ============================================================
// Построение пути
// course-1/season-autumn/latin/lexicon.json
// ============================================================
export const getSeasonFolder = (season) => {
  const s = (season || "").toLowerCase();
  if (s === "зима" || s === "winter") return "season-winter";
  if (s === "весна" || s === "spring") return "season-spring";
  if (s === "лето" || s === "summer") return "season-summer";
  return "season-autumn"; // Осень
};

export const buildMaterialPath = ({ courseId, season, relativePath }) => {
  const course = courseId || "course-1";
  const seasonFolder = getSeasonFolder(season);
  const rel = (relativePath || "").replace(/^\/+/, "");
  return `${course}/${seasonFolder}/${rel}`;
};
// ============================================================
// Загрузка: S3 → кэш → error
// ============================================================
export const loadMaterialData = async (rawDataFile) => {
  const dataFile = normalizeDataFile(rawDataFile);

  // Guard
  if (!dataFile || !dataFile.endsWith(".json")) {
    console.error(
      `[materials] Некорректный путь к данным: ${JSON.stringify(rawDataFile)}`,
    );
    return { data: null, source: "error" };
  }

  const cached = readCache(dataFile);
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  // 1. Свежий кэш + онлайн — отдаём сразу, S3 не дёргаем
  if (cached?.isFresh && isOnline) {
    return { data: cached.data, source: "cache" };
  }

  // 2. Офлайн — только кэш
  if (!isOnline) {
    if (cached) {
      return {
        data: cached.data,
        source: cached.isFresh ? "cache" : "cache-stale",
      };
    }
    // Офлайн и нет кэша — ошибка
    console.warn(`[materials] Офлайн, кэша нет: ${dataFile}`);
    return { data: null, source: "error" };
  }

  // 3. Онлайн + кэш устарел (или нет) — пробуем S3
  try {
    const url = `${SUPABASE_URL}/storage/v1/object/public/${MATERIALS_BUCKET}/${dataFile}`;
    const res = await fetch(url, { cache: "no-cache" });

    if (res.ok) {
      const data = await res.json();
      writeCache(dataFile, data);
      return { data, source: "s3" };
    }

    console.warn(`[materials] S3 ${res.status} для ${dataFile}, пробуем кэш`);
  } catch (err) {
    console.warn(`[materials] S3 недоступен для ${dataFile}:`, err.message);
  }

  // 4. S3 упал — отдаём кэш (даже устаревший)
  if (cached) {
    return {
      data: cached.data,
      source: cached.isFresh ? "cache" : "cache-stale",
    };
  }

  // 5. Совсем ничего нет
  return { data: null, source: "error" };
};

// ============================================================
// Очистка кэша
// ============================================================
export const clearMaterialsCache = () => {
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith(CACHE_PREFIX),
  );
  keys.forEach((k) => localStorage.removeItem(k));
};

// ============================================================
// Загрузка манифеста (на курс/семестр) + обогащение
// ============================================================
export const loadMaterialsManifest = async ({ courseId, season }) => {
  const path = buildMaterialPath({
    courseId,
    season,
    relativePath: "manifest.json",
  });
  return loadMaterialData(path);
};

export const enrichAction = (action, { courseId, season }) => ({
  ...action,
  dataFile: buildMaterialPath({
    courseId,
    season,
    relativePath: action.relativeFile || "",
  }),
});

export const enrichSubject = (subject, context) => ({
  ...subject,
  actions: (subject.actions || []).map((a) => enrichAction(a, context)),
});

export const loadAndEnrichManifest = async ({ courseId, season }) => {
  const { data, source } = await loadMaterialsManifest({ courseId, season });
  if (!data) return { subjects: [], source };

  const subjects = (data.subjects || []).map((s) =>
    enrichSubject(s, { courseId, season }),
  );
  return { subjects, source };
};

export const findAction = (subject, actionId) =>
  subject?.actions?.find((a) => a.id === actionId) || null;

export const findSubject = (subjects, subjectId) =>
  subjects.find((s) => s.id === subjectId) || null;
