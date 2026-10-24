import React from "react";

const SOURCE_LABELS = {
  s3: null,
  cache: null,
  "cache-stale": "🕒 Устаревшие данные",
  local: "⚠️ Локальные данные",
  error: "❌ Ошибка загрузки",
};

const SOURCE_HINTS = {
  "cache-stale":
    "Данные устарели (старше 1 дня). Возможно, есть обновления. Перезайдите позже.",
  local:
    "Данные загружены из локальной копии. Возможны неточности — проверьте позже.",
  error: "Не удалось загрузить данные. Проверьте соединение.",
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
