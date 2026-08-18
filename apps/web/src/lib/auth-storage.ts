/**
 * Access-token persistence.
 *
 * localStorage is a deliberate, documented trade-off rather than the
 * strongest option available. The API issues a bearer JWT
 * (services/api/src/lib/jwt.ts) and reads it from the Authorization
 * header; moving to an httpOnly cookie would mean changing the backend
 * auth architecture (cookie issuance plus CSRF protection), which this
 * milestone explicitly does not do. The exposure is the usual one: any
 * XSS on this origin can read the token. It is bounded by the token's
 * short 15-minute lifetime.
 *
 * The key name matches the one the previous LoginPage already wrote to,
 * so existing local sessions are not silently orphaned.
 */
const TOKEN_KEY = "cap.accessToken";

const storage = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    // Private-mode / disabled-storage browsers: degrade to a session
    // that simply does not survive a reload, rather than crashing.
    return null;
  }
};

export const readToken = (): string | null => storage()?.getItem(TOKEN_KEY) ?? null;

export const writeToken = (token: string): void => {
  storage()?.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  storage()?.removeItem(TOKEN_KEY);
};
