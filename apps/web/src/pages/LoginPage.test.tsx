import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../auth/AuthContext";
import { api } from "../lib/api";
import { LoginPage } from "./LoginPage";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return { ...actual, api: { get: vi.fn(), post: vi.fn() }, setUnauthorizedHandler: vi.fn() };
});

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<p>Account screen</p>} />
          <Route path="/verify-email" element={<p>Verification screen</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

const signIn = (password = "CorrectHorse!2026") => {
  fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "asha@example.com" } });
  fireEvent.change(screen.getByLabelText(/Password/), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: /Log in/ }));
};

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("LoginPage", () => {
  it("signs the user in and sends them to their account", async () => {
    mockApi.post.mockResolvedValue({
      data: {
        token: "jwt-token",
        user: { id: "user-1", fullName: "Asha Citizen", email: "asha@example.com", role: "CITIZEN", emailVerified: true }
      }
    });

    renderPage();
    signIn();

    await waitFor(() => expect(screen.getByText("Account screen")).toBeTruthy());
    expect(mockApi.post).toHaveBeenCalledWith("/auth/login", {
      email: "asha@example.com",
      password: "CorrectHorse!2026"
    });
    expect(window.localStorage.getItem("cap.accessToken")).toBe("jwt-token");
  });

  it("shows the API message when the credentials are wrong", async () => {
    mockApi.post.mockRejectedValue({
      response: { status: 401, data: { message: "Email or password is incorrect." } }
    });

    renderPage();
    signIn("WrongPassword!2026");

    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Email or password is incorrect."));
    expect(window.localStorage.getItem("cap.accessToken")).toBeNull();
  });

  it("offers a route out of the unverified-account deadlock", async () => {
    mockApi.post.mockRejectedValue({
      response: { status: 403, data: { message: "Verify your email before signing in.", reason: "email_not_verified" } }
    });

    renderPage();
    signIn();

    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.getByRole("link", { name: "Verify your email" })).toBeTruthy();
  });

  it("validates the form before calling the API", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "not-an-email" } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /Log in/ }));

    await waitFor(() => expect(screen.getByText(/Invalid email/i)).toBeTruthy());
    expect(mockApi.post).not.toHaveBeenCalled();
  });
});
