import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LegalAnswerResponse } from "@cap/contracts";
import { AuthProvider } from "../auth/AuthContext";
import { api } from "../lib/api";
import { LegalAssistantPage } from "./LegalAssistantPage";

vi.mock("../lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/api")>();
  return { ...actual, api: { get: vi.fn(), post: vi.fn() }, setUnauthorizedHandler: vi.fn() };
});

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

const DISCLAIMER = "This module is only for public awareness and information.";

const answeredResponse: LegalAnswerResponse = {
  excerpts: [
    {
      chunk_id: "bnss:43",
      text: "No woman shall be arrested after sunset and before sunrise, save in exceptional circumstances.",
      source: "Bharatiya Nagarik Suraksha Sanhita, 2023",
      act_no: "ACT NO. 46 OF 2023",
      unit: "Section 43",
      official_url: "https://www.indiacode.nic.in/example.pdf",
      verified_as_on: "6th October, 2025",
      coverage_note: "PARTIAL coverage of this Act."
    }
  ],
  message: null,
  abstained: false,
  policy_decision: "answered",
  reason: null,
  sources: ["Bharatiya Nagarik Suraksha Sanhita, 2023"],
  disclaimer_version: "2026-08-16",
  disclaimer_text: DISCLAIMER
};

const abstainedResponse: LegalAnswerResponse = {
  excerpts: [],
  message: "No verified information found.",
  abstained: true,
  policy_decision: "abstained",
  reason: "insufficient_evidence",
  sources: [],
  disclaimer_version: "2026-08-16",
  disclaimer_text: DISCLAIMER
};

const emergencyResponse: LegalAnswerResponse = {
  excerpts: [],
  message: "If you are in immediate danger, call 112 now.",
  abstained: true,
  policy_decision: "redirect_emergency",
  reason: "risk_emergency",
  sources: [],
  disclaimer_version: "2026-08-16",
  disclaimer_text: DISCLAIMER
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <LegalAssistantPage />
      </AuthProvider>
    </MemoryRouter>
  );

const ask = (question: string) => {
  fireEvent.change(screen.getByLabelText("Your question"), { target: { value: question } });
  fireEvent.click(screen.getByRole("button", { name: /Ask/ }));
};

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("LegalAssistantPage", () => {
  it("renders the question form and the disclaimer", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Ask a legal question" })).toBeTruthy();
    expect(screen.getByLabelText("Your question")).toBeTruthy();
    expect(screen.getAllByText(new RegExp(DISCLAIMER)).length).toBeGreaterThan(0);
  });

  it("disables submission until a question is entered", () => {
    renderPage();

    const submit = screen.getByRole("button", { name: /Ask/ }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText("Your question"), { target: { value: "Can I be arrested at night?" } });
    expect(submit.disabled).toBe(false);
  });

  it("submits the question to the Node API and displays the deterministic answer", async () => {
    mockApi.post.mockResolvedValue({ data: answeredResponse });

    renderPage();
    ask("Can a woman be arrested at night?");

    await waitFor(() => expect(screen.getByRole("heading", { name: "What the law says" })).toBeTruthy());

    // The browser talks to the Node API, never to the Python service.
    expect(mockApi.post).toHaveBeenCalledWith("/legal/answer", { question: "Can a woman be arrested at night?" });

    // The excerpt is shown verbatim, exactly as the backend returned it.
    expect(screen.getByText(answeredResponse.excerpts[0].text)).toBeTruthy();
  });

  it("displays the citation, section and official source for each excerpt", async () => {
    mockApi.post.mockResolvedValue({ data: answeredResponse });

    renderPage();
    ask("Can a woman be arrested at night?");

    await waitFor(() => expect(screen.getByRole("heading", { name: "What the law says" })).toBeTruthy());

    // Named in the excerpt citation and again in the distinct-source list.
    expect(screen.getAllByText(/Bharatiya Nagarik Suraksha Sanhita, 2023/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/ACT NO\. 46 OF 2023/)).toBeTruthy();
    expect(screen.getByText(/Section 43/)).toBeTruthy();
    expect(screen.getByText(/Verified as on 6th October, 2025/)).toBeTruthy();
    expect(screen.getByText("PARTIAL coverage of this Act.")).toBeTruthy();

    const officialLink = screen.getByRole("link", { name: /official source/ }) as HTMLAnchorElement;
    expect(officialLink.href).toBe(answeredResponse.excerpts[0].official_url);

    // The distinct-source list the backend computed (singular label for one source).
    expect(screen.getByText("Source")).toBeTruthy();
  });

  it("shows a loading state while the question is in flight and disables the button", async () => {
    let resolveRequest: ((value: unknown) => void) | undefined;
    mockApi.post.mockReturnValue(new Promise((resolve) => {
      resolveRequest = resolve;
    }));

    renderPage();
    ask("Can a woman be arrested at night?");

    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Searching the official legal corpus"));
    expect((screen.getByRole("button", { name: /Searching the law/ }) as HTMLButtonElement).disabled).toBe(true);

    resolveRequest?.({ data: answeredResponse });
    await waitFor(() => expect(screen.getByRole("heading", { name: "What the law says" })).toBeTruthy());
  });

  it("displays an abstention exactly as the backend worded it", async () => {
    mockApi.post.mockResolvedValue({ data: abstainedResponse });

    renderPage();
    ask("What is the capital of France?");

    await waitFor(() => expect(screen.getByText("No verified information found.")).toBeTruthy());
    expect(screen.getByRole("heading", { name: "No verified answer" })).toBeTruthy();
    // Nothing is invented to fill the gap.
    expect(screen.queryByRole("heading", { name: "What the law says" })).toBeNull();
  });

  it("frames a safety redirect differently from an ordinary abstention", async () => {
    mockApi.post.mockResolvedValue({ data: emergencyResponse });

    renderPage();
    ask("Someone is threatening me right now");

    await waitFor(() => expect(screen.getByText("If you are in immediate danger, call 112 now.")).toBeTruthy());
    expect(screen.getByRole("heading", { name: "This needs a person, not an AI answer" })).toBeTruthy();
  });

  it("handles an unavailable AI service", async () => {
    mockApi.post.mockRejectedValue({ response: { status: 503, data: { message: "AI service is unreachable." } } });

    renderPage();
    ask("Can a woman be arrested at night?");

    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.getByRole("alert").textContent).toContain("unavailable right now");
  });

  it("handles a rate-limited request", async () => {
    mockApi.post.mockRejectedValue({ response: { status: 429, data: { message: "Too many legal information requests." } } });

    renderPage();
    ask("Can a woman be arrested at night?");

    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.getByRole("alert").textContent).toContain("Too many questions");
  });
});
