import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../auth/AuthContext";
import { api } from "../lib/api";
import { ProtectedRoute } from "./ProtectedRoute";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return { ...actual, api: { get: vi.fn(), post: vi.fn() }, setUnauthorizedHandler: vi.fn() };
});

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

const renderProtected = () =>
  render(
    <MemoryRouter initialEntries={["/account"]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <p>Private account content</p>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<p>Login screen</p>} />
          <Route path="/legal-assistant" element={<p>Legal assistant</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("ProtectedRoute", () => {
  it("redirects an unauthenticated visitor to the login screen", async () => {
    renderProtected();

    await waitFor(() => expect(screen.getByText("Login screen")).toBeTruthy());
    expect(screen.queryByText("Private account content")).toBeNull();
  });

  it("renders the route once the stored session resolves", async () => {
    window.localStorage.setItem("cap.accessToken", "stored-token");
    mockApi.get.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          fullName: "Asha Citizen",
          email: "asha@example.com",
          role: "CITIZEN",
          emailVerified: true
        }
      }
    });

    renderProtected();

    // The session is checked before deciding, so a refresh does not bounce
    // an authenticated user to /login.
    expect(screen.getByRole("status").textContent).toContain("Checking your session");

    await waitFor(() => expect(screen.getByText("Private account content")).toBeTruthy());
    expect(screen.queryByText("Login screen")).toBeNull();
  });

  it("redirects to login when the stored token is no longer valid", async () => {
    window.localStorage.setItem("cap.accessToken", "expired-token");
    mockApi.get.mockRejectedValue({ response: { status: 401 } });

    renderProtected();

    await waitFor(() => expect(screen.getByText("Login screen")).toBeTruthy());
  });
});
