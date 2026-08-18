import { render, screen, waitFor } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { api } from "../lib/api";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return {
    ...actual,
    api: { get: vi.fn(), post: vi.fn() },
    setUnauthorizedHandler: vi.fn()
  };
});

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

const citizen = {
  id: "user-1",
  fullName: "Asha Citizen",
  email: "asha@example.com",
  role: "CITIZEN" as const,
  emailVerified: true
};

function AuthProbe() {
  const { user, status, login, logout } = useAuth();
  return (
    <div>
      <p data-testid="status">{status}</p>
      <p data-testid="user">{user ? user.fullName : "nobody"}</p>
      <button onClick={() => void login({ email: "asha@example.com", password: "CorrectHorse!2026" }).catch(() => undefined)}>
        Sign in
      </button>
      <button onClick={logout}>Sign out</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("AuthProvider", () => {
  it("starts anonymous when no token is stored", () => {
    renderProbe();

    expect(screen.getByTestId("status").textContent).toBe("anonymous");
    expect(screen.getByTestId("user").textContent).toBe("nobody");
    expect(mockApi.get).not.toHaveBeenCalled();
  });

  it("makes authentication state available after a successful login", async () => {
    mockApi.post.mockResolvedValue({ data: { token: "jwt-token", user: citizen } });

    renderProbe();
    fireEvent.click(screen.getByText("Sign in"));

    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("authenticated"));
    expect(screen.getByTestId("user").textContent).toBe("Asha Citizen");
    // The token is persisted so the session survives a reload.
    expect(window.localStorage.getItem("cap.accessToken")).toBe("jwt-token");
  });

  it("clears authentication on logout", async () => {
    mockApi.post.mockResolvedValue({ data: { token: "jwt-token", user: citizen } });

    renderProbe();
    fireEvent.click(screen.getByText("Sign in"));
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("authenticated"));

    fireEvent.click(screen.getByText("Sign out"));

    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("anonymous"));
    expect(screen.getByTestId("user").textContent).toBe("nobody");
    expect(window.localStorage.getItem("cap.accessToken")).toBeNull();
  });

  it("restores the current user from /auth/me when a token is already stored", async () => {
    window.localStorage.setItem("cap.accessToken", "stored-token");
    mockApi.get.mockResolvedValue({ data: { user: citizen } });

    renderProbe();

    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("authenticated"));
    expect(mockApi.get).toHaveBeenCalledWith("/auth/me");
    expect(screen.getByTestId("user").textContent).toBe("Asha Citizen");
  });

  it("falls back to anonymous when the stored token is rejected", async () => {
    window.localStorage.setItem("cap.accessToken", "expired-token");
    mockApi.get.mockRejectedValue({ response: { status: 401 } });

    renderProbe();

    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("anonymous"));
    expect(screen.getByTestId("user").textContent).toBe("nobody");
  });

  it("keeps the caller informed when login fails", async () => {
    mockApi.post.mockRejectedValue({ response: { status: 401, data: { message: "Email or password is incorrect." } } });

    renderProbe();
    fireEvent.click(screen.getByText("Sign in"));

    await waitFor(() => expect(mockApi.post).toHaveBeenCalled());
    expect(screen.getByTestId("status").textContent).toBe("anonymous");
    expect(window.localStorage.getItem("cap.accessToken")).toBeNull();
  });
});
