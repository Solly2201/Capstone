import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../auth/AuthContext";
import { api } from "../lib/api";
import { CreatePetitionPage } from "./CreatePetitionPage";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return { ...actual, api: { get: vi.fn(), post: vi.fn() }, setUnauthorizedHandler: vi.fn() };
});

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

const VALID_DESCRIPTION =
  "The last evening bus on route 14 was withdrawn in June. Shift workers now walk home in the dark along an unlit stretch of road, and there is no alternative service after 8pm.";

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/petitions/new"]}>
      <AuthProvider>
        <Routes>
          <Route path="/petitions/new" element={<CreatePetitionPage />} />
          <Route path="/petitions/:id" element={<p>Petition detail screen</p>} />
          <Route path="/petitions/mine" element={<p>My petitions screen</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText(/^Title/), {
    target: { value: "Restore the evening bus service on route 14" }
  });
  fireEvent.change(screen.getByLabelText(/What you are asking for/), {
    target: { value: VALID_DESCRIPTION }
  });
  fireEvent.change(screen.getByLabelText(/Signature goal/), { target: { value: "500" } });
};

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("CreatePetitionPage", () => {
  it("renders the form with the category choices from the shared contract", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Start a petition" })).toBeTruthy();
    expect(screen.getByLabelText("Category")).toBeTruthy();
    expect(screen.getByRole("option", { name: "Public transport" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Roads and infrastructure" })).toBeTruthy();
  });

  it("warns that a published petition cannot be edited", () => {
    renderPage();

    expect(screen.getByText(/cannot be edited/)).toBeTruthy();
  });

  it("publishes the petition and moves to its page", async () => {
    mockApi.post.mockResolvedValue({ data: { petition: { id: "petition-1" } } });

    renderPage();
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /Publish petition/ }));

    await waitFor(() => expect(screen.getByText("Petition detail screen")).toBeTruthy());
    expect(mockApi.post).toHaveBeenCalledWith("/petitions", {
      category: "infrastructure",
      title: "Restore the evening bus service on route 14",
      description: VALID_DESCRIPTION,
      signatureGoal: 500
    });
  });

  it("sends nothing but the four contract fields", async () => {
    mockApi.post.mockResolvedValue({ data: { petition: { id: "petition-1" } } });

    renderPage();
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /Publish petition/ }));

    await waitFor(() => expect(mockApi.post).toHaveBeenCalled());
    const [, body] = mockApi.post.mock.calls[0] as [string, Record<string, unknown>];
    expect(Object.keys(body).sort()).toEqual(["category", "description", "signatureGoal", "title"]);
  });

  it("rejects a title that is too short without calling the API", async () => {
    renderPage();
    fillValidForm();
    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Buses" } });
    fireEvent.click(screen.getByRole("button", { name: /Publish petition/ }));

    await waitFor(() => expect(screen.getByText(/at least 10 character/i)).toBeTruthy());
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it("rejects a description that is too thin without calling the API", async () => {
    renderPage();
    fillValidForm();
    fireEvent.change(screen.getByLabelText(/What you are asking for/), {
      target: { value: "Please fix it." }
    });
    fireEvent.click(screen.getByRole("button", { name: /Publish petition/ }));

    await waitFor(() => expect(mockApi.post).not.toHaveBeenCalled());
  });

  it("rejects a signature goal outside the allowed range", async () => {
    renderPage();
    fillValidForm();
    fireEvent.change(screen.getByLabelText(/Signature goal/), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: /Publish petition/ }));

    await waitFor(() => expect(mockApi.post).not.toHaveBeenCalled());
  });

  it("counts the description length as it is typed", () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/What you are asking for/), { target: { value: "abcdef" } });

    expect(screen.getByText(/6 of 5000 characters/)).toBeTruthy();
  });

  it("shows the API's message when publishing fails", async () => {
    mockApi.post.mockRejectedValue({
      response: { status: 429, data: { message: "Too many petitions created. Please try again later." } }
    });

    renderPage();
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /Publish petition/ }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("Too many petitions created.")
    );
  });
});
