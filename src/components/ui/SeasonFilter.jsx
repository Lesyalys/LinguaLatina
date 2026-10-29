import React from "react";
import { useFilter } from "../../context/FilterContext";

const SeasonFilter = () => {
  const { season, setSeason, availableSeasons } = useFilter();

  if (!availableSeasons || availableSeasons.length <= 1) return null;

  return (
    <div className="season-filter">
      <label className="season-filter__label">Семестр</label>
      <select
        className="season-filter__select"
        value={season}
        onChange={(e) => setSeason(e.target.value)}
      >
        {availableSeasons.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SeasonFilter;
