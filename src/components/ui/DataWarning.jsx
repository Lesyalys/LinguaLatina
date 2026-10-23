import React from "react";

const SOURCE_LABELS = {
  s3: null, // не показываем — всё ок
  cache: null, // кеш — тоже ок, не показываем
  local: "⚠️ Локальные данные",
  error: "❌ Ошибка загрузки",
};

const SOURCE_HINTS = {
  local:
    "Данные загружены из локальной копии. Возможны неточности — проверьте позже.",
  error: "Не удалось загрузить данные. Проверьте соединение.",
};

const DataWarning = ({ source }) => {
  if (!source || source === "s3" || source === "cache") return null;

  const label = SOURCE_LABELS[source] || "⚠️ Неизвестный источник";
  const hint = SOURCE_HINTS[source] || "";

  return (
    <div className={`data-warning data-warning--${source}`}>
      <span className="data-warning__icon">
        {source === "error" ? "❌" : "⚠️"}
      </span>
      <div className="data-warning__body">
        <strong>{label}</strong>
        {hint && <p>{hint}</p>}
      </div>
    </div>
  );
};

export default DataWarning;
