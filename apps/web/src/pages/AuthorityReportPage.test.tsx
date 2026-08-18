import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CivicReport } from "@cap/contracts";
import { AuthProvider } from "../auth/AuthContext";
import { api } from "../lib/api";
import { AuthorityReportPage } from "./AuthorityReportPage";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return {
    ...actual,
    api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
    setUnauthorizedHandler: vi.fn()
  };
});

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

const REPORT_ID = "report-1";

const staff = (role: "AUTHORITY" | "ADMIN") => ({
  id: "staff-1",
  fullName: "Ravi Officer",
  email: "ravi@authority.local",
  role,
  emailVerified: true
});

const report = (overrides: Partial<CivicReport> = {}): CivicReport => ({
  id: REPORT_ID,
  reporterId: "user-1",
  category: "pothole",
  title: "Deep pothole outside the bus stop",
  description: "A large pothole has been here for weeks.",
  latitude: 19.07609,
  longitude: 72.87742,
  landmark: "Near the market gate",
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

const renderPage = async (role: "AUTHORITY" | "ADMIN" = "AUTHORITY") => {
  window.localStorage.setItem("cap.accessToken", "token");
  mockApi.get.mockImplementation((path: string) => {
    if (path === "/auth/me") return Promise.resolve({ data: { user: staff(role) } });
    return Promise.resolve({ data: { report: currentReport } });
  });

  render(
    <MemoryRouter initialEntries={[`/authority/reports/${REPORT_ID}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/authority/reports/:id" element={<AuthorityReportPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

  await waitFor(() => expect(screen.getByRole("heading", { name: currentReport.title })).toBeTruthy());
};

let currentReport: CivicReport;

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  currentReport = report();
});

describe("AuthorityReportPage", () => {
  it("shows the report with its status, deadline and description", async () => {
    await renderPage();

    expect(screen.getByText("Submitted")).toBeTruthy();
    expect(screen.getByText(/Due /)).toBeTruthy();
    expect(screen.getByText("A large pothole has been here for weeks.")).toBeTruthy();
  });

  it("offers only the transitions valid from the current state", async () => {
    await renderPage();

    // From SUBMITTED an authority may acknowledge or reject, nothing else.
    expect(screen.getByLabelText(/Acknowledge and start reviewing/)).toBeTruthy();
    expect(screen.getByLabelText(/Reject with a reason/)).toBeTruthy();
    expect(screen.queryByLabelText(/Mark resolved/)).toBeNull();
    expect(screen.queryByLabelText(/Accept and begin work/)).toBeNull();
  });

  it("does not offer an authority the admin-only reopen", async () => {
    currentReport = report({ status: "RESOLVED" });
    await renderPage("AUTHORITY");

    expect(screen.getByText(/This report is closed/)).toBeTruthy();
    expect(screen.queryByLabelText(/Reopen a resolved report/)).toBeNull();
  });

  it("offers an admin the reopen action on a closed report", async () => {
    currentReport = report({ status: "RESOLVED" });
    await renderPage("ADMIN");

    expect(screen.getByLabelText(/Reopen a resolved report/)).toBeTruthy();
  });

  it("performs a transition and shows the updated report", async () => {
    await renderPage();
    mockApi.post.mockResolvedValue({ data: { report: report({ status: "UNDER_REVIEW" }) } });

    fireEvent.click(screen.getByLabelText(/Acknowledge and start reviewing/));
    fireEvent.click(screen.getByRole("button", { name: /Apply action/ }));

    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Report updated."));
    expect(mockApi.post).toHaveBeenCalledWith(`/civic/reports/${REPORT_ID}/transitions`, {
      status: "UNDER_REVIEW"
    });
    expect(screen.getByText("Under review")).toBeTruthy();
  });

  it("keeps the apply button disabled until a required reason is written", async () => {
    await renderPage();

    fireEvent.click(screen.getByLabelText(/Reject with a reason/));
    const apply = screen.getByRole("button", { name: /Apply action/ }) as HTMLButtonElement;
    expect(apply.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/Note/), { target: { value: "Duplicate of an earlier report." } });
    expect((screen.getByRole("button", { name: /Apply action/ }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("sends the note with a transition that requires one", async () => {
    await renderPage();
    mockApi.post.mockResolvedValue({ data: { report: report({ status: "REJECTED" }) } });

    fireEvent.click(screen.getByLabelText(/Reject with a reason/));
    fireEvent.change(screen.getByLabelText(/Note/), { target: { value: "Duplicate of an earlier report." } });
    fireEvent.click(screen.getByRole("button", { name: /Apply action/ }));

    await waitFor(() => expect(mockApi.post).toHaveBeenCalled());
    expect(mockApi.post).toHaveBeenCalledWith(`/civic/reports/${REPORT_ID}/transitions`, {
      status: "REJECTED",
      note: "Duplicate of an earlier report."
    });
  });

  it("surfaces a rejected transition from the API", async () => {
    await renderPage();
    mockApi.post.mockRejectedValue({
      response: { status: 409, data: { message: "This report changed while you were working on it." } }
    });

    fireEvent.click(screen.getByLabelText(/Acknowledge and start reviewing/));
    fireEvent.click(screen.getByRole("button", { name: /Apply action/ }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("This report changed while you were working on it.")
    );
  });

  it("changes priority and reports that the deadline moved", async () => {
    await renderPage();
    mockApi.patch.mockResolvedValue({
      data: { report: report({ priority: "HIGH", dueAt: "2026-08-20T10:00:00.000Z" }) }
    });

    fireEvent.change(screen.getByLabelText(/Priority/), { target: { value: "HIGH" } });

    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Priority updated"));
    expect(mockApi.patch).toHaveBeenCalledWith(`/civic/reports/${REPORT_ID}/priority`, { priority: "HIGH" });
  });

  it("renders the status history the server recorded", async () => {
    currentReport = report({
      status: "REJECTED",
      history: [
        {
          type: "STATUS",
          from: "SUBMITTED",
          to: "REJECTED",
          actorRole: "AUTHORITY",
          actorId: "staff-1",
          note: "Duplicate of an earlier report.",
          at: "2026-08-19T09:00:00.000Z"
        }
      ]
    });
    await renderPage();

    expect(screen.getByText("Submitted → Rejected")).toBeTruthy();
    expect(screen.getByText("Duplicate of an earlier report.")).toBeTruthy();
  });

  it("shows a not-found state for a missing report", async () => {
    window.localStorage.setItem("cap.accessToken", "token");
    mockApi.get.mockImplementation((path: string) => {
      if (path === "/auth/me") return Promise.resolve({ data: { user: staff("AUTHORITY") } });
      return Promise.reject({ response: { status: 404, data: { message: "Report not found." } } });
    });

    render(
      <MemoryRouter initialEntries={[`/authority/reports/${REPORT_ID}`]}>
        <AuthProvider>
          <Routes>
            <Route path="/authority/reports/:id" element={<AuthorityReportPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByRole("heading", { name: "Report not found" })).toBeTruthy());
  });
});
