import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, setUnauthorizedHandler } from "./api";
import { readRefreshToken, readToken, writeRefreshToken, writeToken } from "./auth-storage";

// The transparent-renewal interceptor, tested against the real axios
// instance with a stubbed adapter (no network). The refresh call itself
// uses bare axios.post, spied on here.

type AdapterResponse = { status: number; data: unknown };

let plan: AdapterResponse[] = [];
let seenConfigs: Array<Record<string, unknown>> = [];

const installAdapter = () => {
  api.defaults.adapter = async (config) => {
    seenConfigs.push(config as unknown as Record<string, unknown>);
    const next = plan.shift() ?? { status: 200, data: {} };
    const response = {
      status: next.status,
      statusText: String(next.status),
      data: next.data,
      headers: {},
      config
    };
    // A custom adapter settles its own responses: non-2xx must reject the
    // way the built-in adapters do, or the interceptor never runs.
    if (next.status >= 200 && next.status < 300) return response;
    throw new axios.AxiosError(`Request failed with status ${next.status}`, undefined, config, null, response);
  };
};

const postSpy = vi.spyOn(axios, "post");

beforeEach(() => {
  window.localStorage.clear();
  plan = [];
  seenConfigs = [];
  postSpy.mockReset();
  installAdapter();
});

afterEach(() => {
  setUnauthorizedHandler(null);
});

describe("access-token refresh on 401", () => {
  it("renews the pair once and replays the failed request", async () => {
    writeToken("stale-access");
    writeRefreshToken("valid-refresh");
    plan = [
      { status: 401, data: { message: "expired" } },
      { status: 200, data: { user: { id: "u1" } } }
    ];
    postSpy.mockResolvedValue({ data: { token: "new-access", refreshToken: "new-refresh" } });

    const response = await api.get("/auth/me");

    expect(response.status).toBe(200);
    // One refresh call, with the stored refresh token.
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy.mock.calls[0][1]).toEqual({ refreshToken: "valid-refresh" });
    // The rotated pair is persisted, and the replay carried the new token.
    expect(readToken()).toBe("new-access");
    expect(readRefreshToken()).toBe("new-refresh");
    const replay = seenConfigs.at(-1) as { headers: Record<string, string> };
    expect(replay.headers.Authorization).toBe("Bearer new-access");
  });

  it("ends the session when refresh itself fails", async () => {
    writeToken("stale-access");
    writeRefreshToken("revoked-refresh");
    plan = [{ status: 401, data: { message: "expired" } }];
    postSpy.mockRejectedValue(new Error("401"));
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    await expect(api.get("/auth/me")).rejects.toBeTruthy();

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(readToken()).toBeNull();
    expect(readRefreshToken()).toBeNull();
  });

  it("does not attempt a refresh with no stored refresh token", async () => {
    writeToken("stale-access");
    plan = [{ status: 401, data: { message: "expired" } }];
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    await expect(api.get("/auth/me")).rejects.toBeTruthy();

    expect(postSpy).not.toHaveBeenCalled();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("does not treat a login 401 as a session expiry", async () => {
    // No Authorization header: no token in storage.
    plan = [{ status: 401, data: { message: "wrong password" } }];
    writeRefreshToken("should-not-be-used");
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    await expect(api.post("/auth/login", { email: "a@b.c", password: "x" })).rejects.toBeTruthy();

    expect(postSpy).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
    // The stored refresh token survives: someone else's failed login must
    // not destroy the session.
    expect(readRefreshToken()).toBe("should-not-be-used");
  });

  it("never loops: a 401 on the replayed request ends the session", async () => {
    writeToken("stale-access");
    writeRefreshToken("valid-refresh");
    plan = [
      { status: 401, data: { message: "expired" } },
      { status: 401, data: { message: "still expired" } }
    ];
    postSpy.mockResolvedValue({ data: { token: "new-access", refreshToken: "new-refresh" } });
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    await expect(api.get("/auth/me")).rejects.toBeTruthy();

    // Exactly one refresh; the second 401 is terminal.
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
