import axios from "axios";
import { clearToken, readToken } from "./auth-storage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only a session expiry if a token was actually presented: a 401 from
    // a login attempt means "wrong password", not "your session died".
    const presentedToken = Boolean(error?.config?.headers?.Authorization);
    if (error?.response?.status === 401 && presentedToken) {
      clearToken();
      onUnauthorized?.();
    }
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
