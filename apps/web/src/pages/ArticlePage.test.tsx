import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import { ArticlePage } from "./ArticlePage";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/learn/:slug" element={<ArticlePage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("ArticlePage", () => {
  it("renders the article with its category and body", () => {
    renderAt("/learn/fir-vs-ncr");

    expect(screen.getByRole("heading", { level: 1, name: "FIR vs NCR" })).toBeTruthy();
    expect(screen.getByText("Police, FIR & Complaints")).toBeTruthy();
    expect(screen.getByText(/no police officer shall investigate a non-cognizable case/i)).toBeTruthy();
  });

  it("shows a per-paragraph citation", () => {
    renderAt("/learn/fir-vs-ncr");

    expect(screen.getByText("Source: BNSS, Section 174(2)")).toBeTruthy();
  });

  it("lists the official source with a link", () => {
    renderAt("/learn/bail-procedure-basics");

    expect(screen.getByRole("heading", { name: "Sources" })).toBeTruthy();
    expect(screen.getByText("Bharatiya Nagarik Suraksha Sanhita, 2023")).toBeTruthy();
    const link = screen.getAllByRole("link", { name: /Official source/ })[0];
    expect(link.getAttribute("href")).toContain("indiacode.nic.in");
    expect(link.getAttribute("rel")).toBe("noreferrer");
  });

  it("shows the scope note when the article declares one", () => {
    renderAt("/learn/bail-procedure-basics");

    expect(screen.getByText(/What this does not cover:/)).toBeTruthy();
  });

  it("offers back navigation and related articles in the same category", () => {
    renderAt("/learn/what-is-bail");

    const back = screen.getAllByRole("link", { name: /Back to learning library/ })[0];
    expect(back.getAttribute("href")).toBe("/learn");
    expect(screen.getByRole("heading", { name: "More in Arrest & Bail" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Regular vs Anticipatory Bail" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "What Is Bail?" })).toBeNull();
  });

  it("shows a not-found state for an unknown slug", () => {
    renderAt("/learn/not-a-real-article");

    expect(screen.getByRole("heading", { name: "Article not found" })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /Back to learning library/ })[0]).toBeTruthy();
  });
});
