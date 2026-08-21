// Token persistence.
//
// localStorage is a documented trade-off, not the strongest option: the
// API reads a bearer JWT from the Authorization header, and moving to an
// httpOnly cookie would mean cookie issuance plus CSRF protection on the
// backend. The exposure is the usual one -- any XSS on this origin can
// read both tokens. The refresh token widens the stolen-token window to
// its 7-day lifetime, bounded by the server-side revocation lever: every
// refresh re-checks the account's tokenVersion, so bumping it ends the
// session immediately.
const TOKEN_KEY = "cap.accessToken";
const REFRESH_KEY = "cap.refreshToken";

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

export const readRefreshToken = (): string | null => storage()?.getItem(REFRESH_KEY) ?? null;

export const writeRefreshToken = (token: string): void => {
  storage()?.setItem(REFRESH_KEY, token);
};

/** Clears the whole session: access and refresh token together. */
export const clearToken = (): void => {
  storage()?.removeItem(TOKEN_KEY);
  storage()?.removeItem(REFRESH_KEY);
};
