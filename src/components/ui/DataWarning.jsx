const SOURCE_LABELS = {
  s3: null,
  cache: null,
  "cache-stale": "🕒 Устаревшие данные",
  error: "❌ Нет данных",
};

const SOURCE_HINTS = {
  "cache-stale":
    "Данные старше 1 дня. Проверьте соединение — обновим при следующем запросе.",
  error: "Не удалось загрузить данные. Проверьте соединение с интернетом.",
};

const DataWarning = ({ source, onRetry }) => {
  if (!source || source === "s3" || source === "cache") return null;

  const label = SOURCE_LABELS[source] || "⚠️ Неизвестный источник";
  const hint = SOURCE_HINTS[source] || "";

  return (
    <div className={`data-warning data-warning--${source}`}>
      <span className="data-warning__icon">
        {source === "error" ? "❌" : source === "cache-stale" ? "🕒" : "⚠️"}
      </span>
      <div className="data-warning__body">
        <strong>{label}</strong>
        {hint && <p>{hint}</p>}
        {onRetry && (
          <button
            type="button"
            className="data-warning__retry"
            onClick={onRetry}
          >
            🔄 Обновить
          </button>
        )}
      </div>
    </div>
  );
};

export default DataWarning;
