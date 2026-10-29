import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import { PresenceProvider } from "../context/PresenceContext.jsx";
import { ThemeProvider } from "../context/ThemeContext.jsx"; // ←
import { ScheduleProvider } from "../context/ScheduleContext.jsx";
import { FilterProvider } from "../context/FilterContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PresenceProvider>
          <ScheduleProvider>
            <FilterProvider>
              <App />
            </FilterProvider>
          </ScheduleProvider>
        </PresenceProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
