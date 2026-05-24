import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { authApi } from "../api/client";
import { authStorage } from "../utils/authStorage";
import { decodeJwt } from "../utils/decodeJwt";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(
    () => authStorage.getAccessToken() || null,
  );

  const user = useMemo(() => {
    const decoded = decodeJwt(accessToken);
    if (!decoded) return null;
    return {
      id: decoded._id,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
    };
  }, [accessToken]);

  const applyTokens = useCallback((tokens) => {
    authStorage.setTokens(tokens);
    setAccessToken(tokens.accessToken);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    applyTokens(res.data);
    return decodeJwt(res.data.accessToken);
  }, [applyTokens]);

  const register = useCallback(async (payload) => {
    await authApi.register(payload);
  }, []);

  const setRole = useCallback(
    async (role) => {
      const res = await authApi.setRole(role);
      applyTokens(res.data);
      return decodeJwt(res.data.accessToken);
    },
    [applyTokens],
  );

  const logout = useCallback(() => {
    authStorage.clear();
    setAccessToken(null);
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated: Boolean(accessToken),
      login,
      register,
      setRole,
      logout,
    }),
    [accessToken, user, login, register, setRole, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
