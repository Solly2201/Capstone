import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import {
  faqs,
  learnCategories,
  learningArticles,
  questionsForArticle,
  quizQuestions
} from "../content/learn";
import { LearnPage } from "./LearnPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LearnPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("LearnPage", () => {
  it("groups the library by category", () => {
    renderPage();

    for (const category of learnCategories) {
      expect(screen.getByRole("heading", { level: 2, name: category.title })).toBeTruthy();
    }
    expect(screen.getByRole("heading", { name: "What Is an FIR?" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Right to Equality" })).toBeTruthy();
  });

  it("links each article card to its detail route", () => {
    renderPage();

    const link = screen.getByRole("link", { name: /What Is an FIR\?/ });
    expect(link.getAttribute("href")).toBe("/learn/what-is-an-fir");
  });

  it("reports how many articles are showing", () => {
    renderPage();

    expect(screen.getByRole("status").textContent).toBe(
      `${learningArticles.length} of ${learningArticles.length} articles · ${faqs.length} of ${faqs.length} FAQs`
    );
  });

  it("narrows the library when a category filter is applied", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Arrest & Bail" }));

    expect(screen.getByRole("heading", { name: "What Is Bail?" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Right to Equality" })).toBeNull();
  });

  it("filters by search text", () => {
    renderPage();

    fireEvent.change(screen.getByLabelText("Search learning articles"), {
      target: { value: "anticipatory" }
    });

    expect(screen.getByRole("heading", { name: "Regular vs Anticipatory Bail" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Consumer Rights" })).toBeNull();
  });

  it("shows an empty state when nothing matches, and can clear it", () => {
    renderPage();
    const search = screen.getByLabelText("Search learning articles");

    fireEvent.change(search, { target: { value: "zzzzz no such topic" } });
    expect(screen.getByText("No articles match that search")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.queryByText("No articles match that search")).toBeNull();
    expect(screen.getByRole("heading", { name: "Right to Equality" })).toBeTruthy();
  });

  it("names the source acts on each article card", () => {
    renderPage();

    const card = screen.getByRole("link", { name: /Where a Consumer Complaint Is Filed/ });
    expect(within(card).getByText("Consumer Protection Act, 2019")).toBeTruthy();
  });

  it("states which topics are deliberately not covered yet", () => {
    renderPage();

    // Several categories now declare gaps, so this is deliberately a
    // "there is at least one, and it names a real gap" assertion rather
    // than an exact-count one.
    expect(screen.getAllByText("Not covered yet").length).toBeGreaterThan(0);
    expect(screen.getByText(/Workplace and labour rights/)).toBeTruthy();
    expect(screen.getByText(/Sexual offences against children/)).toBeTruthy();
  });

  it("summarises the size of the library, including the question bank", () => {
    renderPage();

    expect(
      screen.getByText(
        `${learningArticles.length} articles · ${faqs.length} practical FAQs · ${learnCategories.length} topics · ${quizQuestions.length} practice questions`
      )
    ).toBeTruthy();
  });

  it("shows how many practice questions each article card carries", () => {
    renderPage();

    const card = screen.getByRole("link", { name: /What Is an FIR\?/ });
    const count = questionsForArticle("what-is-an-fir").length;
    expect(within(card).getByText(`${count} practice questions`)).toBeTruthy();
  });

  it("keeps every one of the newer categories reachable by its filter chip", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Legal Aid & Access to Justice" }));

    expect(screen.getByRole("heading", { name: "Lok Adalats" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "What Is an FIR?" })).toBeNull();
  });

  it("keeps the module disclaimer visible", () => {
    renderPage();

    expect(
      screen.getAllByText(/only for public awareness and information/).length
    ).toBeGreaterThan(0);
  });

  it("shows the FAQ section alongside the learning articles", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: /FAQs · What should I do\?/ })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /The police won't register my FIR/ })
    ).toBeTruthy();
  });

  it("counts FAQs as well as articles in the result summary", () => {
    renderPage();

    expect(screen.getByRole("status").textContent).toContain(
      `${faqs.length} of ${faqs.length} FAQs`
    );
  });

  it("finds an FAQ from citizen wording that is not in its title", () => {
    renderPage();

    fireEvent.change(screen.getByLabelText("Search learning articles"), {
      target: { value: "cops won't file" }
    });

    // The FAQ is titled "The police won't register my FIR" -- the match
    // comes from the citizen-language tags, which is the point of them.
    expect(
      screen.getByRole("button", { name: /The police won't register my FIR/ })
    ).toBeTruthy();
  });

  it("narrows FAQs with the category filter, like articles", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Consumer Rights" }));

    expect(screen.getByRole("button", { name: /A shop sold me something defective/ })).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /The police won't register my FIR/ })
    ).toBeNull();
  });

  it("hides the FAQ section when nothing matches, without breaking the empty state", () => {
    renderPage();

    fireEvent.change(screen.getByLabelText("Search learning articles"), {
      target: { value: "zzzzz no such topic" }
    });

    expect(screen.queryByRole("heading", { name: /FAQs · What should I do\?/ })).toBeNull();
    expect(screen.getByText("No articles match that search")).toBeTruthy();
  });
});
