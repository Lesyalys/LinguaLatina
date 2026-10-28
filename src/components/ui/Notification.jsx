/**
 * Плашка инлайн-уведомления (замена alert).
 * Парный хук — src/hooks/useNotice.js
 *
 *   const notice = useNotice();
 *   <Notice msg={notice.msg} type={notice.type} onClose={notice.hide} />
 */
export const Notice = ({ msg, type = "error", onClose }) => {
  if (!msg) return null;

  return (
    <div
      className={`notification notification--${type}`}
      role="alert"
      onClick={onClose}
    >
      <span>{msg}</span>
      <button
        type="button"
        className="notification__close"
        aria-label="Закрыть"
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  );
};
