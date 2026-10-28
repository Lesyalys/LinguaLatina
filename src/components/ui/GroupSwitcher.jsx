import React from "react";

const GroupSwitcher = ({ group, onChange, label = "Моя подгруппа:" }) => {
  return (
    <div className="group-switcher">
      {label && <span className="group-switcher__label">{label}</span>}
      <div className="group-switcher__buttons">
        <button
          type="button"
          className={`group-btn ${group === "A" ? "active" : ""}`}
          onClick={() => onChange("A")}
        >
          Группа A
        </button>
        <button
          type="button"
          className={`group-btn ${group === "B" ? "active" : ""}`}
          onClick={() => onChange("B")}
        >
          Группа B
        </button>
      </div>
    </div>
  );
};

export default GroupSwitcher;
