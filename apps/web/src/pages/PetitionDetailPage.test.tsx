import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Petition, UserRole } from "@cap/contracts";
import { AuthProvider } from "../auth/AuthContext";
import { api } from "../lib/api";
import { PetitionDetailPage } from "./PetitionDetailPage";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return {
    ...actual,
    api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
    setUnauthorizedHandler: vi.fn()
  };
});

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const PETITION_ID = "petition-1";
const CREATOR_ID = "citizen-1";
const OTHER_ID = "citizen-2";

const account = (role: UserRole, id: string) => ({
  id,
  fullName: role === "CITIZEN" ? "Asha Menon" : "Ravi Officer",
  email: "person@example.com",
  role,
  emailVerified: true
});

const petition = (overrides: Partial<Petition> = {}): Petition => ({
  id: PETITION_ID,
  creatorId: CREATOR_ID,
  creatorName: "Asha Menon",
  title: "Restore the evening bus service on route 14",
  description: "The last evening bus was withdrawn in June and shift workers walk home in the dark.",
  category: "transport",
  status: "OPEN",
  signatureGoal: 500,
  signatureCount: 120,
  hasSigned: false,
  history: [],
  createdAt: "2026-08-18T10:00:00.000Z",
  updatedAt: "2026-08-18T10:00:00.000Z",
  ...overrides
});

/**
 * Renders the page, optionally signed in as a given account. The auth
 * check and the petition fetch share the mocked `get`, so they are
 * dispatched by path.
 */
const renderPage = async (options: { as?: { role: UserRole; id: string }; petition?: Petition } = {}) => {
  const current = options.petition ?? petition();

  if (options.as) {
    window.localStorage.setItem("cap.accessToken", "token");
  }

  mockApi.get.mockImplementation((path: string) => {
    if (path === "/auth/me") {
      return options.as
        ? Promise.resolve({ data: { user: account(options.as.role, options.as.id) } })
        : Promise.reject({ response: { status: 401 } });
    }
    return Promise.resolve({ data: { petition: current } });
  });

  render(
    <MemoryRouter initialEntries={[`/petitions/${PETITION_ID}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/petitions/:id" element={<PetitionDetailPage />} />
          <Route path="/petitions" element={<p>Petition list screen</p>} />
          <Route path="/login" element={<p>Login screen</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

  await waitFor(() => expect(screen.getByRole("heading", { level: 1 })).toBeTruthy());
};

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("PetitionDetailPage", () => {
  it("shows a loading state while the petition is being fetched", () => {
    mockApi.get.mockReturnValue(new Promise(() => undefined));

    render(
      <MemoryRouter initialEntries={[`/petitions/${PETITION_ID}`]}>
        <AuthProvider>
          <Routes>
            <Route path="/petitions/:id" element={<PetitionDetailPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("status").textContent).toContain("Loading petition");
  });

  it("renders the petition for an anonymous reader", async () => {
    await renderPage();

    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "Restore the evening bus service on route 14"
    );
    expect(screen.getByText(/The last evening bus was withdrawn/)).toBeTruthy();
    expect(screen.getByText(/Started by Asha Menon/)).toBeTruthy();
    expect(screen.getByText("Public transport")).toBeTruthy();
    expect(screen.getByText("Open for signatures")).toBeTruthy();
    expect(screen.getByText(/signatures of 500/)).toBeTruthy();
  });

  it("asks an anonymous reader to log in instead of showing a sign button", async () => {
    await renderPage();

    // Matched by the invitation text rather than the link name, because
    // the site header carries its own "Log in" link for anonymous users.
    expect(screen.getByText(/to sign this petition/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Sign this petition/ })).toBeNull();
  });

  it("shows a 'not found' state for a petition the API will not serve", async () => {
    mockApi.get.mockRejectedValue({ response: { status: 404 } });

    render(
      <MemoryRouter initialEntries={[`/petitions/${PETITION_ID}`]}>
        <AuthProvider>
          <Routes>
            <Route path="/petitions/:id" element={<PetitionDetailPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("Petition not found")).toBeTruthy());
  });

  it("shows an error state when the API fails for another reason", async () => {
    mockApi.get.mockRejectedValue({
      response: { status: 500, data: { message: "An unexpected error occurred." } }
    });

    render(
      <MemoryRouter initialEntries={[`/petitions/${PETITION_ID}`]}>
        <AuthProvider>
          <Routes>
            <Route path="/petitions/:id" element={<PetitionDetailPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("An unexpected error occurred.")
    );
  });

  it("lets a citizen sign and updates the count from the server response", async () => {
    await renderPage({ as: { role: "CITIZEN", id: OTHER_ID } });

    mockApi.post.mockResolvedValue({
      data: { petition: petition({ signatureCount: 121, hasSigned: true }), signed: true }
    });

    fireEvent.click(await screen.findByRole("button", { name: /Sign this petition/ }));

    await waitFor(() => expect(screen.getByText(/You have signed this petition/)).toBeTruthy());
    expect(mockApi.post).toHaveBeenCalledWith(`/petitions/${PETITION_ID}/signatures`);
    expect(screen.getByText(/121/)).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Your signature has been recorded.");
  });

  it("shows the already-signed state instead of a sign button", async () => {
    await renderPage({
      as: { role: "CITIZEN", id: OTHER_ID },
      petition: petition({ hasSigned: true })
    });

    expect(screen.getByText(/You have signed this petition/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Sign this petition/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Withdraw my signature/ })).toBeTruthy();
  });

  it("surfaces a duplicate-signature conflict from the API", async () => {
    await renderPage({ as: { role: "CITIZEN", id: OTHER_ID } });

    mockApi.post.mockRejectedValue({
      response: { status: 409, data: { message: "You have already signed this petition." } }
    });

    fireEvent.click(await screen.findByRole("button", { name: /Sign this petition/ }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("You have already signed this petition.")
    );
  });

  it("lets a citizen withdraw a signature they gave", async () => {
    await renderPage({
      as: { role: "CITIZEN", id: OTHER_ID },
      petition: petition({ hasSigned: true, signatureCount: 121 })
    });

    mockApi.delete.mockResolvedValue({
      data: { petition: petition({ hasSigned: false, signatureCount: 120 }), signed: false }
    });

    fireEvent.click(screen.getByRole("button", { name: /Withdraw my signature/ }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Sign this petition/ })).toBeTruthy()
    );
    expect(mockApi.delete).toHaveBeenCalledWith(`/petitions/${PETITION_ID}/signatures/me`);
  });

  it("offers no signing at all once the petition is closed", async () => {
    await renderPage({
      as: { role: "CITIZEN", id: OTHER_ID },
      petition: petition({ status: "CLOSED" })
    });

    expect(screen.getByText(/no longer collecting signatures/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Sign this petition/ })).toBeNull();
  });

  it("offers no withdrawal on a closed petition the citizen had signed", async () => {
    await renderPage({
      as: { role: "CITIZEN", id: OTHER_ID },
      petition: petition({ status: "ANSWERED", hasSigned: true })
    });

    expect(screen.getByText(/You have signed this petition/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Withdraw my signature/ })).toBeNull();
  });

  it("tells staff they are the body being petitioned rather than a signer", async () => {
    await renderPage({ as: { role: "AUTHORITY", id: "staff-1" } });

    expect(screen.getByText(/Authority accounts do not sign petitions/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Sign this petition/ })).toBeNull();
  });

  it("shows a stranger no action panel at all", async () => {
    await renderPage({ as: { role: "CITIZEN", id: OTHER_ID } });

    expect(screen.queryByRole("heading", { name: "Actions" })).toBeNull();
    expect(screen.queryByText(/Move this petition/)).toBeNull();
  });

  it("offers the creator exactly one action: closing their own petition", async () => {
    await renderPage({ as: { role: "CITIZEN", id: CREATOR_ID } });

    expect(screen.getByRole("heading", { name: "Actions" })).toBeTruthy();
    expect(screen.getByText("Your petition")).toBeTruthy();

    const actions = screen.getAllByRole("radio");
    expect(actions).toHaveLength(1);
    expect(screen.getByText(/Close this petition to further signatures/)).toBeTruthy();
    expect(screen.queryByText(/Remove this petition/)).toBeNull();
  });

  it("offers an authority review and removal on an open petition", async () => {
    await renderPage({ as: { role: "AUTHORITY", id: "staff-1" } });

    expect(screen.getByText(/Take this petition up for review/)).toBeTruthy();
    expect(screen.getByText(/Remove this petition/)).toBeTruthy();
    expect(screen.getByText(/Close this petition to further signatures/)).toBeTruthy();
  });

  it("offers an authority no way to reinstate a removed petition", async () => {
    await renderPage({
      as: { role: "AUTHORITY", id: "staff-1" },
      petition: petition({ status: "REJECTED" })
    });

    expect(screen.queryByRole("heading", { name: "Actions" })).toBeNull();
  });

  it("offers an admin the reinstate action a removed petition needs", async () => {
    await renderPage({
      as: { role: "ADMIN", id: "admin-1" },
      petition: petition({ status: "REJECTED" })
    });

    expect(screen.getByText(/Reinstate a removed petition/)).toBeTruthy();
  });

  it("keeps the apply button disabled until a reason is given where one is required", async () => {
    await renderPage({ as: { role: "AUTHORITY", id: "staff-1" } });

    const apply = () => screen.getByRole("button", { name: /Apply action/ }) as HTMLButtonElement;
    expect(apply().disabled).toBe(true);

    fireEvent.click(screen.getByRole("radio", { name: /Remove this petition/ }));
    expect(apply().disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/Reason/), { target: { value: "Duplicate petition." } });
    expect(apply().disabled).toBe(false);
  });

  it("allows a note-free transition immediately after selecting it", async () => {
    await renderPage({ as: { role: "AUTHORITY", id: "staff-1" } });

    fireEvent.click(screen.getByRole("radio", { name: /Take this petition up for review/ }));

    expect((screen.getByRole("button", { name: /Apply action/ }) as HTMLButtonElement).disabled).toBe(
      false
    );
  });

  it("sends the transition and renders the petition the server returns", async () => {
    await renderPage({ as: { role: "AUTHORITY", id: "staff-1" } });

    mockApi.post.mockResolvedValue({ data: { petition: petition({ status: "UNDER_REVIEW" }) } });

    fireEvent.click(screen.getByRole("radio", { name: /Take this petition up for review/ }));
    fireEvent.click(screen.getByRole("button", { name: /Apply action/ }));

    await waitFor(() => expect(screen.getByText("Under review")).toBeTruthy());
    expect(mockApi.post).toHaveBeenCalledWith(`/petitions/${PETITION_ID}/transitions`, {
      status: "UNDER_REVIEW"
    });
  });

  it("reports a rejected transition without changing what is on screen", async () => {
    await renderPage({ as: { role: "AUTHORITY", id: "staff-1" } });

    mockApi.post.mockRejectedValue({
      response: { status: 409, data: { message: "This petition changed while you were working on it." } }
    });

    fireEvent.click(screen.getByRole("radio", { name: /Take this petition up for review/ }));
    fireEvent.click(screen.getByRole("button", { name: /Apply action/ }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("This petition changed while you were")
    );
    expect(screen.getByText("Open for signatures")).toBeTruthy();
  });

  it("renders the history the server returned, including the official response", async () => {
    await renderPage({
      petition: petition({
        status: "ANSWERED",
        history: [
          {
            from: "OPEN",
            to: "UNDER_REVIEW",
            actorCapability: "AUTHORITY",
            at: "2026-08-19T09:00:00.000Z"
          },
          {
            from: "UNDER_REVIEW",
            to: "ANSWERED",
            actorCapability: "AUTHORITY",
            note: "Evening services resume from 1 October.",
            at: "2026-08-20T09:00:00.000Z"
          }
        ]
      })
    });

    const history = within(screen.getByRole("list"));
    expect(history.getByText(/Evening services resume from 1 October/)).toBeTruthy();
    expect(history.getAllByText(/by the civic authority/).length).toBe(2);
  });

  it("distinguishes a creator's own close from a staff action in the history", async () => {
    await renderPage({
      petition: petition({
        status: "CLOSED",
        history: [
          {
            from: "OPEN",
            to: "CLOSED",
            actorCapability: "CREATOR",
            note: "The council fixed this before we finished collecting.",
            at: "2026-08-20T09:00:00.000Z"
          }
        ]
      })
    });

    expect(screen.getByText(/by the petition creator/)).toBeTruthy();
  });

  it("says so plainly when nothing has happened yet", async () => {
    await renderPage();

    expect(screen.getByText("Nothing has happened to this petition yet.")).toBeTruthy();
  });
});
