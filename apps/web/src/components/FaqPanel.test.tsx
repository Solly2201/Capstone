import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { findFaq, type Faq } from "../content/learn";
import { FaqPanel } from "./FaqPanel";

function renderFaq(faq: Faq) {
  return render(
    <MemoryRouter>
      <FaqPanel faq={faq} />
    </MemoryRouter>
  );
}

const plain = findFaq("report-crime-another-area")!;
const emergency = findFaq("violence-at-home")!;
const serious = findFaq("what-to-do-if-arrested")!;

describe("FaqPanel", () => {
  it("shows the question collapsed, and the answer only once opened", () => {
    renderFaq(plain);

    expect(screen.getByRole("button", { name: new RegExp(plain.question) })).toBeTruthy();
    expect(screen.queryByText(plain.shortAnswer)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: new RegExp(plain.question) }));
    expect(screen.getByText(plain.shortAnswer)).toBeTruthy();
  });

  it("reports its expanded state for assistive technology", () => {
    renderFaq(plain);
    const toggle = screen.getByRole("button", { name: new RegExp(plain.question) });

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("renders every cited provision with its source label", () => {
    renderFaq(plain);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(plain.question) }));

    for (const paragraph of plain.legalBasis) {
      expect(screen.getByText(paragraph.text)).toBeTruthy();
      expect(screen.getByText(`Source: ${paragraph.citation!.label}`)).toBeTruthy();
    }
  });

  it("always shows the scope note, so an answer never reads as advice", () => {
    renderFaq(plain);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(plain.question) }));

    expect(screen.getByText(plain.scopeNote)).toBeTruthy();
    expect(screen.getByText(/Scope:/)).toBeTruthy();
  });

  it("leads an emergency FAQ with getting help, announced as an alert", () => {
    renderFaq(emergency);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(emergency.question) }));

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("If you are in danger right now");
    expect(alert.textContent).toContain("112");
  });

  it("frames a serious FAQ toward a lawyer rather than as an alert", () => {
    renderFaq(serious);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(serious.question) }));

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("serious matter");
  });

  it("shows no urgency banner on an ordinary FAQ", () => {
    renderFaq(plain);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(plain.question) }));

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText(/If you are in danger right now/)).toBeNull();
  });

  it("links to the related learning articles by title", () => {
    renderFaq(plain);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(plain.question) }));

    const link = screen.getByRole("link", { name: "What Is an FIR?" });
    expect(link.getAttribute("href")).toBe("/learn/what-is-an-fir");
  });

  it("links each cited Act to its official source", () => {
    renderFaq(plain);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(plain.question) }));

    const official = screen.getAllByRole("link", { name: /Bharatiya Nagarik Suraksha Sanhita/ })[0];
    expect(official.getAttribute("href")).toContain("indiacode.nic.in");
    expect(official.getAttribute("rel")).toBe("noreferrer");
  });

  it("lists the practical steps when the FAQ has them", () => {
    renderFaq(emergency);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(emergency.question) }));

    const steps = screen.getByRole("list", { name: undefined });
    expect(within(steps).getAllByRole("listitem").length).toBeGreaterThan(0);
    expect(screen.getByText("What you can generally do")).toBeTruthy();
  });

  it("omits the steps heading for an FAQ that declares none", () => {
    const noSteps = findFaq("do-i-have-to-answer-police")!;
    expect(noSteps.whatYouCanDo).toBeUndefined();

    renderFaq(noSteps);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(noSteps.question) }));
    expect(screen.queryByText("What you can generally do")).toBeNull();
  });
});
