import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { LoginInput, LoginResponse, PublicUser, RegisterInput, RegisterResponse } from "@cap/contracts";
import { api, setUnauthorizedHandler } from "../lib/api";
import { clearToken, readToken, writeToken } from "../lib/auth-storage";

/**
 * Frontend auth state for the existing bearer-token API.
 *
 * The stored JWT is the only persisted state; the user object is always
 * re-fetched from `GET /auth/me` on load rather than cached alongside
 * it, so a revoked or expired token can never leave a stale "signed in"
 * shell on screen.
 *
 * Note the API issues a 15-minute access token and exposes no refresh
 * endpoint, so a session ends 15 minutes after sign-in. Adding refresh
 * tokens would change the backend auth architecture, which is out of
 * scope for this integration milestone -- the app instead degrades
 * cleanly: the response interceptor clears the token on a 401 and the
 * user is returned to the login screen.
 */

export type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  user: PublicUser | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<PublicUser>;
  register: (input: RegisterInput) => Promise<RegisterResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (readToken() ? "loading" : "anonymous"));

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus("anonymous");
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus("anonymous");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (!readToken()) return;
    let active = true;

    api
      .get<{ user: PublicUser }>("/auth/me")
      .then((response) => {
        if (!active) return;
        setUser(response.data.user);
        setStatus("authenticated");
      })
      .catch(() => {
        // A 401 has already cleared the token via the interceptor; any
        // other failure (API down) still leaves us unable to prove who
        // the user is, so present as anonymous either way.
        if (!active) return;
        setUser(null);
        setStatus("anonymous");
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const response = await api.post<LoginResponse>("/auth/login", input);
    writeToken(response.data.token);
    setUser(response.data.user);
    setStatus("authenticated");
    return response.data.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    // Registration deliberately does not sign the user in: the API
    // requires a verified email address before it will issue a token.
    const response = await api.post<RegisterResponse>("/auth/register", input);
    return response.data;
  }, []);

  const value = useMemo(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider.");
  return context;
}
