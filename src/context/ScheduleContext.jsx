import React, { createContext, useContext, useState, useEffect } from "react";
import { loadScheduleData } from "../lib/schedule";

const ScheduleContext = createContext(null);

export const ScheduleProvider = ({ children }) => {
  const [scheduleArray, setScheduleArray] = useState([]); // 🎯 массив, а не null
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    loadScheduleData().then(({ data, source }) => {
      if (cancelled) return;
      setScheduleArray(Array.isArray(data) ? data : []); // 🎯 массив
      setSource(source);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ScheduleContext.Provider value={{ scheduleArray, source, loading }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useScheduleContext = () => {
  const ctx = useContext(ScheduleContext);
  if (!ctx)
    throw new Error("useScheduleContext must be used within ScheduleProvider");
  return ctx;
};
