import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const token = localStorage.getItem("token");
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch { setUser(null); localStorage.removeItem("token"); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const loginAdmin = async (email, password) => {
    const { data } = await api.post("/auth/admin/login", { email, password });
    localStorage.setItem("token", data.token);
    await refresh();
    return data.user;
  };
  const loginEmployee = async (email, password) => {
    const { data } = await api.post("/auth/employee/login", { email, password });
    localStorage.setItem("token", data.token);
    await refresh();
    return data.user;
  };
  const logout = () => { localStorage.removeItem("token"); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, loginAdmin, loginEmployee, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
