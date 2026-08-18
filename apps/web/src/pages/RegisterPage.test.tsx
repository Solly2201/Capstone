import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../auth/AuthContext";
import { api } from "../lib/api";
import { RegisterPage } from "./RegisterPage";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return { ...actual, api: { get: vi.fn(), post: vi.fn() }, setUnauthorizedHandler: vi.fn() };
});

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

const newUser = {
  id: "user-1",
  fullName: "Asha Citizen",
  email: "asha@example.com",
  role: "CITIZEN" as const,
  emailVerified: false
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/register"]}>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<p>Verification screen</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

const fillForm = (overrides: Partial<Record<"fullName" | "email" | "password", string>> = {}) => {
  fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: overrides.fullName ?? "Asha Citizen" } });
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: overrides.email ?? "asha@example.com" } });
  fireEvent.change(screen.getByLabelText(/Password/), { target: { value: overrides.password ?? "CorrectHorse!2026" } });
};

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("RegisterPage", () => {
  it("registers an account and moves the user to email verification", async () => {
    mockApi.post.mockResolvedValue({
      data: {
        user: newUser,
        message: "Account created.",
        verification: { token: "a".repeat(64), expiresAt: new Date().toISOString(), deliveredVia: "api-response" }
      }
    });

    renderPage();
    fillForm();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Create account/ }));

    await waitFor(() => expect(screen.getByText("Verification screen")).toBeTruthy());
    expect(mockApi.post).toHaveBeenCalledWith("/auth/register", {
      fullName: "Asha Citizen",
      email: "asha@example.com",
      password: "CorrectHorse!2026",
      acceptedDisclaimer: true
    });
  });

  it("rejects an invalid registration before calling the API", async () => {
    renderPage();
    fillForm({ email: "not-an-email", password: "short" });
    fireEvent.click(screen.getByRole("button", { name: /Create account/ }));

    await waitFor(() => expect(screen.getByText(/Invalid email/i)).toBeTruthy());
    // zod's own message, distinct from the form's "At least 12 characters." hint.
    expect(screen.getByText(/String must contain at least 12 character/i)).toBeTruthy();
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it("requires the legal-information disclaimer to be accepted", async () => {
    renderPage();
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /Create account/ }));

    await waitFor(() =>
      expect(screen.getByText("You must accept this before creating an account.")).toBeTruthy()
    );
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it("surfaces an API rejection such as a duplicate email", async () => {
    mockApi.post.mockRejectedValue({
      response: { status: 409, data: { message: "An account already exists for this email." } }
    });

    renderPage();
    fillForm();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Create account/ }));

    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("already exists"));
  });

  it("asks the user to check their inbox when no development token is returned", async () => {
    mockApi.post.mockResolvedValue({ data: { user: newUser, message: "Account created." } });

    renderPage();
    fillForm();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Create account/ }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Confirm your email" })).toBeTruthy());
  });
});
