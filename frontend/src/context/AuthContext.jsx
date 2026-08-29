import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("intervuex_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("intervuex_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const u = data.user;
    setUser(u);
    localStorage.setItem("intervuex_user", JSON.stringify(u));
    return u;
  };

  const register = async (name, email, password, targetRole, skills) => {
    const data = await api("/api/auth/register", {
      method: "POST",
      body: { name, email, password, targetRole, skills },
    });
    const u = data.user;
    setUser(u);
    localStorage.setItem("intervuex_user", JSON.stringify(u));
    return u;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("intervuex_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
