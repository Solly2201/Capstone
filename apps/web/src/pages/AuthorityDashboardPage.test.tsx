import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CivicReport } from "@cap/contracts";
import { AuthProvider } from "../auth/AuthContext";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { api } from "../lib/api";
import { AuthorityDashboardPage } from "./AuthorityDashboardPage";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() }, setUnauthorizedHandler: vi.fn() };
});

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn> };

const user = (role: "CITIZEN" | "AUTHORITY") => ({
  id: "user-1",
  fullName: role === "AUTHORITY" ? "Ravi Officer" : "Asha Citizen",
  email: "someone@example.com",
  role,
  emailVerified: true
});

const report = (overrides: Partial<CivicReport> = {}): CivicReport => ({
  id: "report-1",
  reporterId: "user-9",
  category: "garbage",
  title: "Uncollected rubbish on the corner",
  description: "Rubbish has not been collected for two weeks.",
  latitude: 19.07609,
  longitude: 72.87742,
  status: "SUBMITTED",
  priority: "MEDIUM",
  media: [],
  dueAt: "2026-08-23T10:00:00.000Z",
  isOverdue: false,
  history: [],
  createdAt: "2026-08-18T10:00:00.000Z",
  updatedAt: "2026-08-18T10:00:00.000Z",
  ...overrides
});

/** Serves /auth/me plus the queue, so the provider resolves a staff user. */
const withQueue = (reports: CivicReport[], role: "CITIZEN" | "AUTHORITY" = "AUTHORITY") => {
  window.localStorage.setItem("cap.accessToken", "token");
  mockApi.get.mockImplementation((path: string) => {
    if (path === "/auth/me") return Promise.resolve({ data: { user: user(role) } });
    return Promise.resolve({ data: { reports, total: reports.length, limit: 25, offset: 0 } });
  });
};

const renderDashboard = () =>
  render(
    <MemoryRouter initialEntries={["/authority"]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/authority"
            element={
              <ProtectedRoute roles={["AUTHORITY", "ADMIN"]}>
                <AuthorityDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<p>Login screen</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("AuthorityDashboardPage", () => {
  it("lists the queue with status, priority and deadline", async () => {
    withQueue([report()]);
    renderDashboard();

    await waitFor(() => expect(screen.getByText("Uncollected rubbish on the corner")).toBeTruthy());

    // Scoped to the queue entry: "Submitted" also appears as a filter option.
    const entry = screen.getByRole("link", { name: /Uncollected rubbish on the corner/ });
    expect(entry.textContent).toContain("Submitted");
    expect(entry.textContent).toContain("Priority: MEDIUM");
    expect(entry.textContent).toMatch(/Due /);
    expect(screen.getByText(/Showing 1 of 1 report\./)).toBeTruthy();
  });

  it("flags a report that is past its deadline", async () => {
    withQueue([report({ isOverdue: true })]);
    renderDashboard();

    await waitFor(() => expect(screen.getByText(/Overdue since/)).toBeTruthy());
  });

  it("asks the server to filter rather than filtering on the client", async () => {
    withQueue([report()]);
    renderDashboard();
    await waitFor(() => expect(screen.getByText("Uncollected rubbish on the corner")).toBeTruthy());

    fireEvent.change(screen.getByLabelText(/Status/), { target: { value: "UNDER_REVIEW" } });

    await waitFor(() => {
      const queueCalls = mockApi.get.mock.calls.filter(([path]) => path === "/civic/authority/reports");
      const latest = queueCalls[queueCalls.length - 1];
      expect(latest[1].params.status).toBe("UNDER_REVIEW");
    });
  });

  it("sends the overdue filter as a query parameter", async () => {
    withQueue([report()]);
    renderDashboard();
    await waitFor(() => expect(screen.getByText("Uncollected rubbish on the corner")).toBeTruthy());

    fireEvent.click(screen.getByLabelText(/Only past their deadline/));

    await waitFor(() => {
      const queueCalls = mockApi.get.mock.calls.filter(([path]) => path === "/civic/authority/reports");
      expect(queueCalls[queueCalls.length - 1][1].params.overdue).toBe("true");
    });
  });

  it("shows an empty state when nothing matches", async () => {
    withQueue([]);
    renderDashboard();

    await waitFor(() => expect(screen.getByText("Nothing matches these filters.")).toBeTruthy());
  });

  it("shows an error state when the queue cannot be loaded", async () => {
    window.localStorage.setItem("cap.accessToken", "token");
    mockApi.get.mockImplementation((path: string) => {
      if (path === "/auth/me") return Promise.resolve({ data: { user: user("AUTHORITY") } });
      return Promise.reject({ response: { status: 500, data: { message: "An unexpected error occurred." } } });
    });

    renderDashboard();

    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("An unexpected error occurred."));
  });

  it("keeps a citizen out of the authority area", async () => {
    withQueue([report()], "CITIZEN");
    renderDashboard();

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "This area is for civic authority staff" })).toBeTruthy()
    );
    expect(screen.queryByText("Uncollected rubbish on the corner")).toBeNull();
  });

  it("sends an anonymous visitor to the login screen", async () => {
    renderDashboard();

    await waitFor(() => expect(screen.getByText("Login screen")).toBeTruthy());
  });
});
