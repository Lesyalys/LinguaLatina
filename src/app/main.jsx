import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import { PresenceProvider } from "../context/PresenceContext.jsx";
import { FilterProvider } from "../context/FilterContext.jsx";
import { ThemeProvider } from "../context/ThemeContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PresenceProvider>
          <FilterProvider>
            <App />
          </FilterProvider>
        </PresenceProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
