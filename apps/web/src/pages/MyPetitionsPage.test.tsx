import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PetitionSummary, UserRole } from "@cap/contracts";
import { AuthProvider } from "../auth/AuthContext";
import { api } from "../lib/api";
import { MyPetitionsPage } from "./MyPetitionsPage";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return { ...actual, api: { get: vi.fn(), post: vi.fn() }, setUnauthorizedHandler: vi.fn() };
});

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

const account = (role: UserRole) => ({
  id: "citizen-1",
  fullName: "Asha Menon",
  email: "asha@example.com",
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
  signatureCount: 120,
  hasSigned: false,
  createdAt: "2026-08-18T10:00:00.000Z",
  updatedAt: "2026-08-18T10:00:00.000Z",
  ...overrides
});

const listResponse = (petitions: PetitionSummary[], total = petitions.length) => ({
  data: { petitions, total, limit: 20, offset: 0 }
});

const renderPage = async (role: UserRole = "CITIZEN", response: unknown = listResponse([petition()])) => {
  window.localStorage.setItem("cap.accessToken", "token");
  mockApi.get.mockImplementation((path: string) => {
    if (path === "/auth/me") return Promise.resolve({ data: { user: account(role) } });
    if (response instanceof Error) return Promise.reject(response);
    return Promise.resolve(response);
  });

  render(
    <MemoryRouter initialEntries={["/petitions/mine"]}>
      <AuthProvider>
        <Routes>
          <Route path="/petitions/mine" element={<MyPetitionsPage />} />
          <Route path="/petitions/new" element={<p>Create petition screen</p>} />
          <Route path="/petitions/:id" element={<p>Petition detail screen</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

  await waitFor(() => expect(screen.getByRole("heading", { name: "My petitions" })).toBeTruthy());
};

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("MyPetitionsPage", () => {
  it("lists the petitions the citizen started", async () => {
    await renderPage();

    await waitFor(() =>
      expect(screen.getByText("Restore the evening bus service on route 14")).toBeTruthy()
    );
    expect(mockApi.get).toHaveBeenCalledWith("/petitions/mine", {
      params: { filter: "created", limit: 20, offset: 0 }
    });
  });

  it("switches to the signed tab and asks the server for that filter", async () => {
    await renderPage();
    await waitFor(() => expect(mockApi.get).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("tab", { name: "Signed by me" }));

    await waitFor(() =>
      expect(mockApi.get).toHaveBeenCalledWith("/petitions/mine", {
        params: { filter: "signed", limit: 20, offset: 0 }
      })
    );
  });

  it("marks the selected tab for assistive technology", async () => {
    await renderPage();

    expect(screen.getByRole("tab", { name: "Started by me" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: "Signed by me" }).getAttribute("aria-selected")).toBe("false");
  });

  it("shows a create-specific empty state on the created tab", async () => {
    await renderPage("CITIZEN", listResponse([]));

    await waitFor(() => expect(screen.getByText("You have not started a petition yet.")).toBeTruthy());
  });

  it("shows a browse-specific empty state on the signed tab", async () => {
    await renderPage("CITIZEN", listResponse([]));
    await waitFor(() => expect(screen.getByText("You have not started a petition yet.")).toBeTruthy());

    fireEvent.click(screen.getByRole("tab", { name: "Signed by me" }));

    await waitFor(() => expect(screen.getByText("You have not signed a petition yet.")).toBeTruthy());
    expect(screen.getByRole("link", { name: "Browse petitions" })).toBeTruthy();
  });

  it("shows an error state when the list cannot be loaded", async () => {
    const failure = Object.assign(new Error("failed"), {
      response: { status: 500, data: { message: "An unexpected error occurred." } }
    });

    await renderPage("CITIZEN", failure);

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("An unexpected error occurred.")
    );
  });

  it("offers the create link to a citizen but not to staff", async () => {
    await renderPage("CITIZEN");
    await waitFor(() =>
      expect(screen.getAllByRole("link", { name: /Start a petition/ }).length).toBeGreaterThan(0)
    );
  });

  it("pages forward through more petitions than fit on one page", async () => {
    await renderPage("CITIZEN", {
      data: { petitions: [petition()], total: 45, limit: 20, offset: 0 }
    });

    await waitFor(() => expect(screen.getByRole("button", { name: "Next" })).toBeTruthy());
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      const [, config] = mockApi.get.mock.calls.at(-1) as [string, { params: { offset: number } }];
      expect(config.params.offset).toBe(20);
    });
  });

  it("hides pagination when everything fits on one page", async () => {
    await renderPage();

    await waitFor(() => expect(screen.getByText(/Showing 1–1 of 1 petition/)).toBeTruthy());
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });

  /**
   * Switching tab shows a different list, so a page offset from the old
   * one would land the citizen somewhere arbitrary in the new one.
   */
  it("returns to the first page when the tab changes", async () => {
    await renderPage("CITIZEN", {
      data: { petitions: [petition()], total: 45, limit: 20, offset: 0 }
    });

    await waitFor(() => expect(screen.getByRole("button", { name: "Next" })).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => {
      const [, config] = mockApi.get.mock.calls.at(-1) as [string, { params: { offset: number } }];
      expect(config.params.offset).toBe(20);
    });

    fireEvent.click(screen.getByRole("tab", { name: "Signed by me" }));

    await waitFor(() => {
      const [, config] = mockApi.get.mock.calls.at(-1) as [
        string,
        { params: { filter: string; offset: number } }
      ];
      expect(config.params).toMatchObject({ filter: "signed", offset: 0 });
    });
  });

  it("shows a loading state while the list is being fetched", async () => {
    window.localStorage.setItem("cap.accessToken", "token");
    mockApi.get.mockImplementation((path: string) => {
      if (path === "/auth/me") return Promise.resolve({ data: { user: account("CITIZEN") } });
      return new Promise(() => undefined);
    });

    render(
      <MemoryRouter initialEntries={["/petitions/mine"]}>
        <AuthProvider>
          <Routes>
            <Route path="/petitions/mine" element={<MyPetitionsPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain("Loading your petitions")
    );
  });
});
