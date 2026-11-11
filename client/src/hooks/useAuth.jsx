import { createContext, useContext, useState, useCallback } from "react";
import { apiFetch } from "../services/api.js";
import { API_PATHS } from "../utils/constants.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("sweety_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("sweety_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const data = await apiFetch(API_PATHS.REGISTER, {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      localStorage.setItem("sweety_token", data.token);
      localStorage.setItem("sweety_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await apiFetch(API_PATHS.LOGIN, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("sweety_token", data.token);
      localStorage.setItem("sweety_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sweety_token");
    localStorage.removeItem("sweety_user");
    setToken(null);
    setUser(null);
  }, []);

  // Called by apiFetch consumers when a 401 is received
  const clearSession = useCallback(() => {
    localStorage.removeItem("sweety_token");
    localStorage.removeItem("sweety_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, loading, register, login, logout, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
