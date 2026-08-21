import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { civicMediaMaxBytes } from "@cap/contracts";
import { AuthProvider } from "../auth/AuthContext";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { api } from "../lib/api";
import { ReportPage } from "./ReportPage";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return { ...actual, api: { get: vi.fn(), post: vi.fn() }, setUnauthorizedHandler: vi.fn() };
});

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

const citizen = {
  id: "user-1",
  fullName: "Asha Citizen",
  email: "asha@example.com",
  role: "CITIZEN" as const,
  emailVerified: true
};

const createdReport = {
  id: "report-1",
  reporterId: "user-1",
  category: "pothole",
  title: "Deep pothole outside the bus stop",
  description: "A large pothole has been here for weeks and buses swerve around it.",
  latitude: 19.07609,
  longitude: 72.87742,
  status: "SUBMITTED",
  priority: "MEDIUM",
  media: [],
  createdAt: "2026-08-18T10:00:00.000Z",
  updatedAt: "2026-08-18T10:00:00.000Z"
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/report"]}>
      <AuthProvider>
        <Routes>
          <Route path="/report" element={<ReportPage />} />
          <Route path="/reports/:id" element={<p>Report detail screen</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText(/Title/), {
    target: { value: "Deep pothole outside the bus stop" }
  });
  fireEvent.change(screen.getByLabelText(/Description/), {
    target: { value: "A large pothole has been here for weeks and buses swerve around it." }
  });
  fireEvent.change(screen.getByLabelText(/Latitude/), { target: { value: "19.07609" } });
  fireEvent.change(screen.getByLabelText(/Longitude/), { target: { value: "72.87742" } });
};

const submit = () => fireEvent.click(screen.getByRole("button", { name: /Submit report/ }));

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("ReportPage", () => {
  it("renders the civic report form", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Report a civic issue" })).toBeTruthy();
    expect(screen.getByLabelText(/Category/)).toBeTruthy();
    expect(screen.getByLabelText(/Title/)).toBeTruthy();
    expect(screen.getByLabelText(/Description/)).toBeTruthy();
    expect(screen.getByLabelText(/Latitude/)).toBeTruthy();
    expect(screen.getByLabelText(/Longitude/)).toBeTruthy();
    expect(screen.getByLabelText("Attach a photo")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Submit report/ })).toBeTruthy();
  });

  it("tells the user that photo metadata is removed", () => {
    renderPage();

    expect(screen.getByText(/metadata .* removed before/i)).toBeTruthy();
  });

  it("blocks submission and reports validation errors on an empty form", async () => {
    renderPage();
    submit();

    await waitFor(() => expect(screen.getByText("Give a short title of 5 to 120 characters.")).toBeTruthy());
    expect(screen.getByText("Describe the issue in 10 to 2000 characters.")).toBeTruthy();
    expect(screen.getByText("Enter a latitude between -90 and 90.")).toBeTruthy();
    expect(screen.getByText("Enter a longitude between -180 and 180.")).toBeTruthy();
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it("rejects out-of-range coordinates before calling the API", async () => {
    renderPage();
    fillValidForm();
    fireEvent.change(screen.getByLabelText(/Latitude/), { target: { value: "412" } });
    submit();

    await waitFor(() => expect(screen.getByText("Enter a latitude between -90 and 90.")).toBeTruthy());
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it("submits the report as multipart form data and opens the new report", async () => {
    mockApi.post.mockResolvedValue({ data: { report: createdReport } });

    renderPage();
    fillValidForm();
    fireEvent.change(screen.getByLabelText(/Landmark/), { target: { value: "Near the market gate" } });
    submit();

    await waitFor(() => expect(screen.getByText("Report detail screen")).toBeTruthy());

    expect(mockApi.post).toHaveBeenCalledTimes(1);
    const [path, body] = mockApi.post.mock.calls[0];
    expect(path).toBe("/civic/reports");
    expect(body).toBeInstanceOf(FormData);

    const form = body as FormData;
    expect(form.get("category")).toBe("pothole");
    expect(form.get("title")).toBe("Deep pothole outside the bus stop");
    expect(form.get("latitude")).toBe("19.07609");
    expect(form.get("longitude")).toBe("72.87742");
    expect(form.get("landmark")).toBe("Near the market gate");
    // reporterId is never sent from the browser -- the API derives it.
    expect(form.get("reporterId")).toBeNull();
  });

  it("shows the API error when submission fails", async () => {
    mockApi.post.mockRejectedValue({
      response: { status: 500, data: { message: "An unexpected error occurred." } }
    });

    renderPage();
    fillValidForm();
    submit();

    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("An unexpected error occurred."));
    expect(screen.queryByText("Report detail screen")).toBeNull();
  });

  it("disables the submit button while the report is in flight", async () => {
    let resolveRequest: ((value: unknown) => void) | undefined;
    mockApi.post.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    renderPage();
    fillValidForm();
    submit();

    await waitFor(() =>
      expect((screen.getByRole("button", { name: /Submitting report/ }) as HTMLButtonElement).disabled).toBe(true)
    );

    resolveRequest?.({ data: { report: createdReport } });
    await waitFor(() => expect(screen.getByText("Report detail screen")).toBeTruthy());
  });

  it("rejects an oversized image without uploading it", async () => {
    renderPage();

    const oversized = new File(["x"], "huge.png", { type: "image/png" });
    Object.defineProperty(oversized, "size", { value: civicMediaMaxBytes + 1 });
    fireEvent.change(screen.getByLabelText("Attach a photo"), { target: { files: [oversized] } });

    await waitFor(() => expect(screen.getByText("That image is larger than the 5 MB limit.")).toBeTruthy());
    expect(screen.queryByText(/Attached: huge\.png/)).toBeNull();
  });

  it("rejects a file that is not a JPEG or PNG", async () => {
    renderPage();

    const wrongType = new File(["#!/bin/sh"], "script.sh", { type: "text/x-shellscript" });
    fireEvent.change(screen.getByLabelText("Attach a photo"), { target: { files: [wrongType] } });

    await waitFor(() => expect(screen.getByText("Only JPEG and PNG images are accepted.")).toBeTruthy());
  });

  it("accepts a valid image and attaches it to the submission", async () => {
    mockApi.post.mockResolvedValue({ data: { report: createdReport } });

    renderPage();
    fillValidForm();
    const photo = new File(["fake-png-bytes"], "pothole.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Attach a photo"), { target: { files: [photo] } });

    await waitFor(() => expect(screen.getByText(/Attached: pothole\.png/)).toBeTruthy());
    submit();

    await waitFor(() => expect(mockApi.post).toHaveBeenCalled());
    const form = mockApi.post.mock.calls[0][1] as FormData;
    expect(form.get("image")).toBeInstanceOf(File);
  });
});

describe("ReportPage duplicate handling", () => {
  const potentialDuplicateError = () => ({
    response: {
      status: 409,
      data: {
        message: "A similar issue was recently reported near this location.",
        code: "POTENTIAL_DUPLICATE",
        potentialDuplicates: [
          {
            id: "report-9",
            title: "Big pothole near college gate",
            category: "pothole",
            status: "UNDER_REVIEW",
            distanceMeters: 42,
            createdAt: "2026-08-15T09:00:00.000Z"
          }
        ]
      }
    }
  });

  it("shows nearby existing reports and lets the citizen decide", async () => {
    mockApi.post.mockRejectedValue(potentialDuplicateError());

    renderPage();
    fillValidForm();
    submit();

    await waitFor(() => expect(screen.getByText("Is this the same problem?")).toBeTruthy());
    expect(screen.getByText("Big pothole near college gate")).toBeTruthy();
    expect(screen.getByText(/about 42 m from your location/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Submit my report anyway/ })).toBeTruthy();
    // The citizen has not been navigated anywhere; nothing was created.
    expect(screen.queryByText("Report detail screen")).toBeNull();
  });

  it("re-submits with the acknowledgement when the citizen chooses to continue", async () => {
    mockApi.post
      .mockRejectedValueOnce(potentialDuplicateError())
      .mockResolvedValueOnce({ data: { report: createdReport } });

    renderPage();
    fillValidForm();
    submit();

    await waitFor(() => expect(screen.getByText("Is this the same problem?")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: /Submit my report anyway/ }));

    await waitFor(() => expect(screen.getByText("Report detail screen")).toBeTruthy());
    expect(mockApi.post).toHaveBeenCalledTimes(2);
    const secondBody = mockApi.post.mock.calls[1][1] as FormData;
    expect(secondBody.get("acknowledgeDuplicates")).toBe("true");
    // The first attempt never claimed acknowledgement.
    const firstBody = mockApi.post.mock.calls[0][1] as FormData;
    expect(firstBody.get("acknowledgeDuplicates")).toBeNull();
  });

  it("lets the citizen dismiss the warning without submitting", async () => {
    mockApi.post.mockRejectedValue(potentialDuplicateError());

    renderPage();
    fillValidForm();
    submit();

    await waitFor(() => expect(screen.getByText("Is this the same problem?")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: /Don.t submit/ }));

    await waitFor(() => expect(screen.queryByText("Is this the same problem?")).toBeNull());
    expect(mockApi.post).toHaveBeenCalledTimes(1);
  });

  it("links to the citizen's own report on an exact resubmission", async () => {
    mockApi.post.mockRejectedValue({
      response: {
        status: 409,
        data: {
          message: "You have already submitted this report.",
          code: "DUPLICATE_REPORT",
          reportId: "report-1"
        }
      }
    });

    renderPage();
    fillValidForm();
    submit();

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("You have already submitted this report.")
    );
    const link = screen.getByRole("link", { name: /View your existing report/ }) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/reports/report-1");
  });
});

describe("ReportPage route protection", () => {
  it("sends an unauthenticated visitor to the login screen", async () => {
    render(
      <MemoryRouter initialEntries={["/report"]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <ReportPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<p>Login screen</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("Login screen")).toBeTruthy());
    expect(screen.queryByRole("heading", { name: "Report a civic issue" })).toBeNull();
  });

  it("renders the form for an authenticated citizen", async () => {
    window.localStorage.setItem("cap.accessToken", "token");
    mockApi.get.mockResolvedValue({ data: { user: citizen } });

    render(
      <MemoryRouter initialEntries={["/report"]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <ReportPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<p>Login screen</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByRole("heading", { name: "Report a civic issue" })).toBeTruthy());
  });
});
