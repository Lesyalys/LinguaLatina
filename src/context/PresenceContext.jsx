import React, { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { usePresence } from "../hooks/usePresence";

const PresenceContext = createContext(new Set());

export const PresenceProvider = ({ children }) => {
  const { user, profile } = useAuth();
  const onlineUsers = usePresence(user, profile);

  return (
    <PresenceContext.Provider value={onlineUsers}>
      {children}
    </PresenceContext.Provider>
  );
};

export const useOnlineUsers = () => useContext(PresenceContext);
