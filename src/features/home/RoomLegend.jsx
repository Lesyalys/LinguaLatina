import React, { useMemo, useState } from "react";
import { ROOM_CODES } from "../../lib/rooms";

/**
 * Легенда аудиторий — простой список.
 *
 * @param {boolean} collapsible — можно ли сворачивать (по умолчанию true).
 */
const RoomLegend = ({ collapsible = true }) => {
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () =>
      Object.entries(ROOM_CODES).map(([code, info]) => ({
        code,
        ...info,
      })),
    [],
  );

  const visibleItems = collapsible && !open ? items.slice(0, 4) : items;

  return (
    <div className="room-legend">
      <div className="room-legend__header">
        <h4 className="room-legend__title">
          <span className="room-legend__icon">🏛</span>
          Аудитории и корпуса
        </h4>
        {collapsible && items.length > 4 && (
          <button
            type="button"
            className="room-legend__toggle"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Свернуть" : "Показать все"}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="room-legend__empty">Нет данных</div>
      ) : (
        <ul className="room-legend__list">
          {visibleItems.map((item) => (
            <li key={item.code} className="room-legend__item">
              <span
                className={`room-legend__code room-legend__code--${item.type}`}
              >
                {item.code}
              </span>
              <span className="room-legend__info">
                <span className="room-legend__name">{item.name}</span>
                {item.address && (
                  <span className="room-legend__address">{item.address}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoomLegend;
