import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("offers each of CAP's three public pathways", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <HomePage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Understand your rights. Act with clarity." })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Learn your rights" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Report a civic issue" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Support a petition" })).toBeTruthy();
  });
});
