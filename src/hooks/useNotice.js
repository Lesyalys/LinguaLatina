import { useCallback, useEffect, useState } from "react";

/**
 * Хук инлайн-уведомления — замена alert().
 *
 *   const notice = useNotice();
 *   notice.show("Не удалось сохранить", "error");
 *   {notice.msg && <Notice {...notice} />}
 *
 * Автоскрытие через 5 секунд, клик по плашке закрывает сразу.
 */
export const useNotice = () => {
  const [state, setState] = useState({ msg: null, type: "error" });

  const show = useCallback((msg, type = "error") => {
    setState({ msg, type });
  }, []);

  const hide = useCallback(() => {
    setState({ msg: null, type: "error" });
  }, []);

  useEffect(() => {
    if (!state.msg) return;
    const timer = setTimeout(hide, 5000);
    return () => clearTimeout(timer);
  }, [state.msg, hide]);

  return { msg: state.msg, type: state.type, show, hide };
};
