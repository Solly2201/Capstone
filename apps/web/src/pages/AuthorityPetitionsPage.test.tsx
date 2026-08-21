import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PetitionSummary } from "@cap/contracts";
import { AuthProvider } from "../auth/AuthContext";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { api } from "../lib/api";
import { AuthorityPetitionsPage } from "./AuthorityPetitionsPage";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return { ...actual, api: { get: vi.fn(), post: vi.fn() }, setUnauthorizedHandler: vi.fn() };
});

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

const account = (role: "CITIZEN" | "AUTHORITY" | "ADMIN") => ({
  id: "account-1",
  fullName: role === "CITIZEN" ? "Asha Menon" : "Ravi Officer",
  email: "person@example.com",
  role,
  emailVerified: true
});

const petition = (overrides: Partial<PetitionSummary> = {}): PetitionSummary => ({
  id: "petition-1",
  title: "Restore the evening bus service on route 14",
  category: "transport",
  status: "OPEN",
  creatorName: "Asha Menon",
  signatureGoal: 500,
  signatureCount: 520,
  hasSigned: false,
  createdAt: "2026-08-18T10:00:00.000Z",
  updatedAt: "2026-08-18T10:00:00.000Z",
  ...overrides
});

const listResponse = (petitions: PetitionSummary[], total = petitions.length) => ({
  data: { petitions, total, limit: 20, offset: 0 }
});

const renderPage = async (
  role: "CITIZEN" | "AUTHORITY" | "ADMIN" = "AUTHORITY",
  response: unknown = listResponse([petition()])
) => {
  window.localStorage.setItem("cap.accessToken", "token");
  mockApi.get.mockImplementation((path: string) => {
    if (path === "/auth/me") return Promise.resolve({ data: { user: account(role) } });
    if (response instanceof Error) return Promise.reject(response);
    return Promise.resolve(response);
  });

  render(
    <MemoryRouter initialEntries={["/authority/petitions"]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/authority/petitions"
            element={
              <ProtectedRoute roles={["AUTHORITY", "ADMIN"]}>
                <AuthorityPetitionsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/petitions/:id" element={<p>Petition detail screen</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("AuthorityPetitionsPage", () => {
  it("lists the queue with status, creator and progress", async () => {
    await renderPage();

    await waitFor(() =>
      expect(screen.getByText("Restore the evening bus service on route 14")).toBeTruthy()
    );
    const row = within(screen.getByRole("listitem"));
    expect(row.getByText("Open for signatures")).toBeTruthy();
    expect(row.getByText(/Started by Asha Menon/)).toBeTruthy();
    expect(row.getByText("Goal reached")).toBeTruthy();
  });

  it("keeps a citizen out of the queue", async () => {
    await renderPage("CITIZEN");

    await waitFor(() =>
      expect(screen.getByText(/This area is for civic authority staff/)).toBeTruthy()
    );
    expect(screen.queryByRole("heading", { name: "Petition queue" })).toBeNull();
  });

  it("admits an admin as well as an authority", async () => {
    await renderPage("ADMIN");

    await waitFor(() => expect(screen.getByRole("heading", { name: "Petition queue" })).toBeTruthy());
  });

  it("offers every status, including removed petitions, unlike the public list", async () => {
    await renderPage();
    await waitFor(() => expect(screen.getByLabelText("Status")).toBeTruthy());

    const options = within(screen.getByLabelText("Status")).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toContain("Removed");
  });

  it("asks the server for the goal filter in both directions", async () => {
    await renderPage();
    await waitFor(() => expect(mockApi.get).toHaveBeenCalledWith("/petitions/authority", expect.anything()));

    fireEvent.change(screen.getByLabelText("Signature goal"), { target: { value: "true" } });
    await waitFor(() => {
      const [path, config] = mockApi.get.mock.calls.at(-1) as [string, { params: Record<string, unknown> }];
      expect(path).toBe("/petitions/authority");
      expect(config.params.goalMet).toBe("true");
    });

    // The API supports the inverse triage too — petitions still short of
    // their goal — which a checkbox could never express.
    fireEvent.change(screen.getByLabelText("Signature goal"), { target: { value: "false" } });
    await waitFor(() => {
      const [, config] = mockApi.get.mock.calls.at(-1) as [string, { params: Record<string, unknown> }];
      expect(config.params.goalMet).toBe("false");
    });
  });

  it("asks the server for a status filter and resets to the first page", async () => {
    await renderPage();
    await waitFor(() => expect(mockApi.get).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "UNDER_REVIEW" } });

    await waitFor(() => {
      const [, config] = mockApi.get.mock.calls.at(-1) as [string, { params: Record<string, unknown> }];
      expect(config.params).toMatchObject({ status: "UNDER_REVIEW", offset: 0 });
    });
  });

  it("shows a loading state and then an empty state when nothing matches", async () => {
    await renderPage("AUTHORITY", listResponse([]));

    // No filter set: an empty database is reported as such…
    await waitFor(() => expect(screen.getByText("The queue is empty.")).toBeTruthy());

    // …and an unmatched filter as an unmatched filter.
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "UNDER_REVIEW" } });
    await waitFor(() => expect(screen.getByText("Nothing matches these filters.")).toBeTruthy());
  });

  it("shows an error state when the queue cannot be loaded", async () => {
    const failure = Object.assign(new Error("failed"), {
      response: { status: 500, data: { message: "An unexpected error occurred." } }
    });

    await renderPage("AUTHORITY", failure);

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("An unexpected error occurred.")
    );
  });

  it("links each queue row to the petition itself rather than a second staff page", async () => {
    await renderPage();

    await waitFor(() => expect(screen.getByRole("listitem")).toBeTruthy());
    const link = within(screen.getByRole("listitem")).getByRole("link");
    expect(link.getAttribute("href")).toBe("/petitions/petition-1");
  });
});
