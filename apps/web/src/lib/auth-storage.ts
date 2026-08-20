// Access-token persistence.
//
// localStorage is a documented trade-off, not the strongest option: the
// API reads a bearer JWT from the Authorization header, and moving to an
// httpOnly cookie would mean cookie issuance plus CSRF protection on the
// backend. The exposure is the usual one -- any XSS on this origin can
// read the token -- bounded by its 15-minute lifetime.
const TOKEN_KEY = "cap.accessToken";

const storage = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    // Private mode or disabled storage: degrade to a session that does
    // not survive a reload, rather than crashing.
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
