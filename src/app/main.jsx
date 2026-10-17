import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import { PresenceProvider } from "../context/PresenceContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <PresenceProvider>
      <App />
    </PresenceProvider>
  </AuthProvider>,
);
