import { useState, useEffect } from "react";
import { loadMaterialData } from "../lib/materials";

/**
 * Универсальный хук загрузки материалов.
 * Заменяет шаблон loadMaterialData + cancelled + setLoading.
 *
 * `loading` вычисляется, а не хранится в состоянии: это избавляет от
 * синхронных setState внутри эффекта (правило react-hooks/set-state-in-effect).
 *
 * @param {string|null} dataFile — путь к файлу данных или null
 * @returns {{ data: any, source: string|null, loading: boolean }}
 */
export const useMaterialData = (dataFile) => {
  const [loaded, setLoaded] = useState({
    file: null,
    data: null,
    source: null,
  });

  useEffect(() => {
    if (!dataFile) return;
    let cancelled = false;
    loadMaterialData(dataFile).then(({ data, source }) => {
      if (cancelled) return;
      setLoaded({ file: dataFile, data, source });
    });
    return () => {
      cancelled = true;
    };
  }, [dataFile]);

  const isCurrent = loaded.file === dataFile;
  const loading = !!dataFile && !isCurrent;

  return {
    data: isCurrent ? loaded.data : null,
    source: isCurrent ? loaded.source : null,
    loading,
  };
};
