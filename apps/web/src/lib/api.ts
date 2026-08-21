import axios, { type AxiosRequestConfig } from "axios";
import { clearToken, readRefreshToken, readToken, writeRefreshToken, writeToken } from "./auth-storage";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000
});

// The browser talks only to the Node API, never to the Python service, so
// one interceptor pair covers every authenticated call in the app.
api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized: (() => void) | null = null;

/** Lets AuthProvider drop its in-memory user when the API rejects a token. */
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

// Single-flight refresh: when several requests fail at once as an access
// token expires, only one refresh call goes out and the rest await it.
// Uses bare axios rather than `api`, so a 401 from the refresh endpoint
// itself can never re-enter this interceptor.
let refreshInFlight: Promise<string | null> | null = null;

const refreshSession = (): Promise<string | null> => {
  if (!refreshInFlight) {
    const refreshToken = readRefreshToken();
    refreshInFlight = (refreshToken
      ? axios
          .post<{ token: string; refreshToken: string }>(`${BASE_URL}/auth/refresh`, { refreshToken }, { timeout: 10_000 })
          .then((response) => {
            writeToken(response.data.token);
            writeRefreshToken(response.data.refreshToken);
            return response.data.token;
          })
          .catch(() => null)
      : Promise.resolve<string | null>(null)
    ).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only a session concern if a token was actually presented: a 401
    // from a login attempt means "wrong password", not "session died".
    const config = error?.config as (AxiosRequestConfig & { _retriedAfterRefresh?: boolean }) | undefined;
    const presentedToken = Boolean(config?.headers?.Authorization);
    if (error?.response?.status !== 401 || !presentedToken) {
      return Promise.reject(error);
    }

    // An expired access token is ordinary now that refresh exists: renew
    // once and replay the request. Only when refresh itself fails is the
    // session genuinely over.
    if (config && !config._retriedAfterRefresh) {
      const token = await refreshSession();
      if (token) {
        config._retriedAfterRefresh = true;
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
        return api.request(config);
      }
    }

    clearToken();
    onUnauthorized?.();
    return Promise.reject(error);
  }
);

/** Extracts the API's error message, falling back to a caller-supplied default. */
export const apiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return fallback;
};

/** The API's machine-readable reason code, where it sends one. */
export const apiErrorReason = (error: unknown): string | undefined => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const reason = (error as { response?: { data?: { reason?: string } } }).response?.data?.reason;
    if (typeof reason === "string") return reason;
  }
  return undefined;
};

export const apiErrorStatus = (error: unknown): number | undefined => {
  if (typeof error === "object" && error !== null && "response" in error) {
    return (error as { response?: { status?: number } }).response?.status;
  }
  return undefined;
};
