import { useMemo, useState } from "react";
import { useMaterialData } from "../../hooks/useMaterialData";
import { ROOMS_FILE } from "../../lib/rooms";
import DataWarning from "../../components/ui/DataWarning";

const RoomLegend = ({ collapsible = true }) => {
  const [open, setOpen] = useState(false);
  const { data, source, loading } = useMaterialData(ROOMS_FILE);

  const items = useMemo(() => {
    const codes = data?.data || data || {};
    return Object.entries(codes).map(([code, info]) => ({
      code,
      ...info,
    }));
  }, [data]);

  const visibleItems = collapsible && !open ? items.slice(0, 4) : items;

  // В данных есть готовая ссылка togis (точка на карте) — используем её.
  // Fallback на поиск по address — только если togis пустая.
  const getMapUrl = (item) => {
    if (item.togis) return item.togis;
    if (!item.address) return null;
    const encoded = encodeURIComponent(item.address);
    return `https://2gis.ru/surgut/search/${encoded}`;
  };

  if (loading) {
    return (
      <div className="room-legend">
        <div className="room-legend__header">
          <h4 className="room-legend__title">
            <span className="room-legend__icon">🏛</span>
            Аудитории и корпуса
          </h4>
        </div>
        <div className="room-legend__empty">Загрузка...</div>
      </div>
    );
  }

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

      <DataWarning source={source} />

      {items.length === 0 ? (
        <div className="room-legend__empty">Нет данных</div>
      ) : (
        <ul className="room-legend__list">
          {visibleItems.map((item) => {
            const mapUrl = getMapUrl(item);
            return (
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
                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="room-legend__map-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📍 Показать на карте
                    </a>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RoomLegend;
