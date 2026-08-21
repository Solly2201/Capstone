import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PetitionSummary } from "@cap/contracts";
import { AuthProvider } from "../auth/AuthContext";
import { api } from "../lib/api";
import { PetitionsPage } from "./PetitionsPage";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return { ...actual, api: { get: vi.fn(), post: vi.fn() }, setUnauthorizedHandler: vi.fn() };
});

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

const citizen = {
  id: "citizen-1",
  fullName: "Asha Menon",
  email: "asha@example.com",
  role: "CITIZEN" as const,
  emailVerified: true
};

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

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/petitions"]}>
      <AuthProvider>
        <Routes>
          <Route path="/petitions" element={<PetitionsPage />} />
          <Route path="/petitions/new" element={<p>Create petition screen</p>} />
          <Route path="/petitions/:id" element={<p>Petition detail screen</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

/** Signs in before rendering, so `hasSigned` and the create link appear. */
const renderSignedIn = () => {
  window.localStorage.setItem("cap.accessToken", "token");
  const petitions = mockApi.get.getMockImplementation();
  mockApi.get.mockImplementation((path: string, config?: unknown) => {
    if (path === "/auth/me") return Promise.resolve({ data: { user: citizen } });
    return petitions ? petitions(path, config) : Promise.resolve(listResponse([]));
  });
  return renderPage();
};

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  mockApi.get.mockResolvedValue(listResponse([]));
});

describe("PetitionsPage", () => {
  it("shows a loading state while petitions are being fetched", () => {
    mockApi.get.mockReturnValue(new Promise(() => undefined));

    renderPage();

    expect(screen.getByRole("status").textContent).toContain("Loading petitions");
  });

  it("lists petitions with status, category, creator and progress", async () => {
    mockApi.get.mockResolvedValue(listResponse([petition()]));

    renderPage();

    await waitFor(() =>
      expect(screen.getByText("Restore the evening bus service on route 14")).toBeTruthy()
    );

    // Scoped to the result row: the status and category names also appear
    // as options in the filter selects above the list.
    const row = within(screen.getByRole("listitem"));
    expect(row.getByText("Open for signatures")).toBeTruthy();
    expect(row.getByText("Public transport")).toBeTruthy();
    expect(row.getByText(/Started by Asha Menon/)).toBeTruthy();
    expect(row.getByText(/signatures of 500/)).toBeTruthy();
    expect(row.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("24");
  });

  it("renders without an account, since petitions are public", async () => {
    mockApi.get.mockResolvedValue(listResponse([petition()]));

    renderPage();

    await waitFor(() => expect(screen.getByText(/Started by Asha Menon/)).toBeTruthy());
    expect(screen.queryByRole("link", { name: /Start a petition/ })).toBeNull();
  });

  it("shows an empty state when nothing has been published", async () => {
    mockApi.get.mockResolvedValue(listResponse([]));

    renderPage();

    await waitFor(() =>
      expect(screen.getByText("No petitions have been started yet.")).toBeTruthy()
    );
  });

  it("shows a filter-specific empty state when filters exclude everything", async () => {
    mockApi.get.mockResolvedValue(listResponse([]));

    renderPage();
    await waitFor(() => expect(screen.getByText("No petitions have been started yet.")).toBeTruthy());

    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "water" } });

    await waitFor(() => expect(screen.getByText("Nothing matches these filters.")).toBeTruthy());
  });

  it("shows an error state when the API fails", async () => {
    mockApi.get.mockRejectedValue({
      response: { status: 500, data: { message: "An unexpected error occurred." } }
    });

    renderPage();

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("An unexpected error occurred.")
    );
  });

  it("asks the server for the chosen filters and sort", async () => {
    mockApi.get.mockResolvedValue(listResponse([petition()]));

    renderPage();
    await waitFor(() => expect(mockApi.get).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "water" } });
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "ANSWERED" } });
    fireEvent.change(screen.getByLabelText("Sort"), { target: { value: "most_signed" } });

    await waitFor(() => {
      const [path, config] = mockApi.get.mock.calls.at(-1) as [string, { params: Record<string, unknown> }];
      expect(path).toBe("/petitions");
      expect(config.params).toMatchObject({
        category: "water",
        status: "ANSWERED",
        sort: "most_signed",
        offset: 0
      });
    });
  });

  it("marks petitions the signed-in citizen already signed", async () => {
    mockApi.get.mockResolvedValue(listResponse([petition({ hasSigned: true })]));

    renderSignedIn();

    await waitFor(() => expect(screen.getByText("You signed this")).toBeTruthy());
  });

  it("offers the create link only to a signed-in citizen", async () => {
    mockApi.get.mockResolvedValue(listResponse([petition()]));

    renderSignedIn();

    await waitFor(() =>
      expect(screen.getAllByRole("link", { name: /Start a petition/ }).length).toBeGreaterThan(0)
    );
  });

  it("pages forward and back through a result set larger than one page", async () => {
    mockApi.get.mockResolvedValue({
      data: { petitions: [petition()], total: 45, limit: 20, offset: 0 }
    });

    renderPage();
    await waitFor(() => expect(screen.getByRole("button", { name: "Next" })).toBeTruthy());

    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      const [, config] = mockApi.get.mock.calls.at(-1) as [string, { params: { offset: number } }];
      expect(config.params.offset).toBe(20);
    });
  });

  it("hides pagination when everything fits on one page", async () => {
    mockApi.get.mockResolvedValue(listResponse([petition()], 1));

    renderPage();

    await waitFor(() => expect(screen.getByText(/Showing 1–1 of 1 petition/)).toBeTruthy());
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });

  it("marks a petition that reached its goal", async () => {
    mockApi.get.mockResolvedValue(listResponse([petition({ signatureCount: 500 })]));

    renderPage();

    await waitFor(() => expect(screen.getByText("Goal reached")).toBeTruthy());
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
  });

  it("searches on submit, not on every keystroke, and resets to the first page", async () => {
    mockApi.get.mockResolvedValue(listResponse([petition()]));

    renderPage();
    await waitFor(() => expect(mockApi.get).toHaveBeenCalled());
    const callsBeforeTyping = mockApi.get.mock.calls.length;

    fireEvent.change(screen.getByLabelText("Search petitions"), { target: { value: "bus service" } });
    // Typing alone fires nothing.
    expect(mockApi.get.mock.calls.length).toBe(callsBeforeTyping);

    fireEvent.click(screen.getByRole("button", { name: /Search/ }));
    await waitFor(() => {
      const [, config] = mockApi.get.mock.calls.at(-1) as [string, { params: Record<string, unknown> }];
      expect(config.params.q).toBe("bus service");
      expect(config.params.offset).toBe(0);
    });
  });

  it("clears the search when the box is emptied", async () => {
    mockApi.get.mockResolvedValue(listResponse([petition()]));

    renderPage();
    await waitFor(() => expect(mockApi.get).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText("Search petitions"), { target: { value: "bus" } });
    fireEvent.click(screen.getByRole("button", { name: /Search/ }));
    await waitFor(() => {
      const [, config] = mockApi.get.mock.calls.at(-1) as [string, { params: Record<string, unknown> }];
      expect(config.params.q).toBe("bus");
    });

    fireEvent.change(screen.getByLabelText("Search petitions"), { target: { value: "" } });
    await waitFor(() => {
      const [, config] = mockApi.get.mock.calls.at(-1) as [string, { params: Record<string, unknown> }];
      expect(config.params.q).toBeUndefined();
    });
  });
});
