import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "../api/auth";
import { loginRequest, logoutRequest, meRequest, refreshTokenRequest } from "../api/auth";
import { UnauthorizedError } from "../api/client";

const TOKEN_KEY = "mypharma_token";
const USER_KEY = "mypharma_user";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const t = localStorage.getItem(TOKEN_KEY);
        const u = localStorage.getItem(USER_KEY);
        if (!t || !u) return;
        setToken(t);
        setUser(JSON.parse(u) as AuthUser);
        const me = await meRequest(t);
        setUser(me.user);
        localStorage.setItem(USER_KEY, JSON.stringify(me.user));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsReady(true);
      }
    };
    hydrate();
  }, []);

  useEffect(() => {
    if (!token) return;
    const id = window.setInterval(async () => {
      try {
        const refreshed = await refreshTokenRequest(token);
        setToken(refreshed.token);
        localStorage.setItem(TOKEN_KEY, refreshed.token);
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      }
    }, 10 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginRequest(email, password);
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    if (token) {
      logoutRequest(token).catch(() => undefined);
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isReady,
      login,
      logout,
    }),
    [token, user, isReady, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
