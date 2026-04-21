import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { decodeToken, isTokenExpired } from '../utils/token';

const AuthContext = createContext();

const SESSION_KEY = 'user_auth';

function getToken() {
  const token = sessionStorage.getItem(SESSION_KEY);
  if (!token || isTokenExpired(token)) {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
  return token;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken);

  const login = useCallback((t) => {
    sessionStorage.setItem(SESSION_KEY, t);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setToken(null);
  }, []);

  const user = useMemo(() => token ? decodeToken(token) : null, [token]);
  const isAuthenticated = Boolean(token && !isTokenExpired(token));

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
