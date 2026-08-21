import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CivicReport } from "@cap/contracts";
import { AuthProvider } from "../auth/AuthContext";
import { api } from "../lib/api";
import { MyReportsPage } from "./MyReportsPage";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return { ...actual, api: { get: vi.fn(), post: vi.fn() }, setUnauthorizedHandler: vi.fn() };
});

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

const report: CivicReport = {
  id: "report-1",
  reporterId: "user-1",
  category: "pothole",
  title: "Deep pothole outside the bus stop",
  description: "A large pothole has been here for weeks and buses swerve around it.",
  latitude: 19.07609,
  longitude: 72.87742,
  landmark: "Near the market gate",
  status: "UNDER_REVIEW",
  priority: "MEDIUM",
  media: [],
  dueAt: "2026-08-23T10:00:00.000Z",
  isOverdue: false,
  history: [],
  createdAt: "2026-08-18T10:00:00.000Z",
  updatedAt: "2026-08-18T10:00:00.000Z"
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/reports/mine"]}>
      <AuthProvider>
        <Routes>
          <Route path="/reports/mine" element={<MyReportsPage />} />
          <Route path="/reports/:id" element={<p>Report detail screen</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("MyReportsPage", () => {
  it("shows a loading state while reports are being fetched", () => {
    mockApi.get.mockReturnValue(new Promise(() => undefined));

    renderPage();

    expect(screen.getByRole("status").textContent).toContain("Loading your reports");
  });

  it("lists the citizen's reports with status, category and location", async () => {
    mockApi.get.mockResolvedValue({ data: { reports: [report] } });

    renderPage();

    await waitFor(() => expect(screen.getByText("Deep pothole outside the bus stop")).toBeTruthy());
    expect(mockApi.get).toHaveBeenCalledWith("/civic/reports/mine", {
      params: { limit: 20, offset: 0 }
    });
    expect(screen.getByText("Under review")).toBeTruthy();
    expect(screen.getByText("Pothole")).toBeTruthy();
    expect(screen.getByText(/Priority: MEDIUM/)).toBeTruthy();
    expect(screen.getByText("Near the market gate")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Deep pothole outside the bus stop/ })).toBeTruthy();
  });

  it("falls back to coordinates when no landmark was given", async () => {
    const withoutLandmark = { ...report, landmark: undefined };
    mockApi.get.mockResolvedValue({ data: { reports: [withoutLandmark] } });

    renderPage();

    await waitFor(() => expect(screen.getByText("19.07609, 72.87742")).toBeTruthy());
  });

  it("shows an empty state when the citizen has no reports", async () => {
    mockApi.get.mockResolvedValue({ data: { reports: [] } });

    renderPage();

    await waitFor(() => expect(screen.getByText("You have not reported anything yet.")).toBeTruthy());
    expect(screen.getByRole("link", { name: /Report an issue/ })).toBeTruthy();
  });

  it("shows an error state when the API fails", async () => {
    mockApi.get.mockRejectedValue({ response: { status: 500, data: { message: "An unexpected error occurred." } } });

    renderPage();

    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("An unexpected error occurred."));
  });

  it("pages past what a single response carries", async () => {
    mockApi.get.mockResolvedValue({ data: { reports: [report], total: 45, limit: 20, offset: 0 } });

    renderPage();

    await waitFor(() => expect(screen.getByText(/Showing 1–1 of 45/)).toBeTruthy());
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      const [, config] = mockApi.get.mock.calls.at(-1) as [string, { params: Record<string, unknown> }];
      expect(config.params.offset).toBe(20);
    });
  });

  it("shows no pager when everything fits on one page", async () => {
    mockApi.get.mockResolvedValue({ data: { reports: [report], total: 1, limit: 20, offset: 0 } });

    renderPage();

    await waitFor(() => expect(screen.getByText("Deep pothole outside the bus stop")).toBeTruthy());
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });
});
