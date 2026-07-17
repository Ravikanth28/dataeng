import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (getToken()) {
        try {
          setUser(await api.me());
        } catch {
          api.logout();
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (data) => {
    const r = await api.login(data);
    setUser(r.user ?? (await api.me()));
    return r;
  };

  const signup = async (data) => {
    const r = await api.signup(data);
    setUser(r.user ?? (await api.me()));
    return r;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
