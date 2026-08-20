import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { questionsForArticle, type QuizQuestion } from "../content/learn";
import { ArticleQuiz } from "./ArticleQuiz";

const questions = questionsForArticle("what-is-an-fir");

function renderQuiz(set: QuizQuestion[] = questions) {
  return render(
    <MemoryRouter>
      <ArticleQuiz questions={set} />
    </MemoryRouter>
  );
}

function start() {
  fireEvent.click(screen.getByRole("button", { name: /Start the quiz/ }));
}

function answer(question: QuizQuestion, optionId: string) {
  const option = question.options.find((o) => o.id === optionId)!;
  fireEvent.click(screen.getByRole("radio", { name: option.text }));
  fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
}

function wrongOptionFor(question: QuizQuestion) {
  return question.options.find((o) => o.id !== question.correctOptionId)!.id;
}

describe("ArticleQuiz", () => {
  it("renders nothing when an article has no questions", () => {
    const { container } = renderQuiz([]);
    expect(container.firstChild).toBeNull();
  });

  it("shows an intro naming the number of questions before the quiz starts", () => {
    renderQuiz();
    expect(screen.getByText(new RegExp(`${questions.length} questions`))).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("shows question number, difficulty and a progress bar once started", () => {
    renderQuiz();
    start();

    expect(screen.getByText(new RegExp(`Question 1 of ${questions.length}`))).toBeTruthy();
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("1");
    expect(bar.getAttribute("aria-valuemax")).toBe(String(questions.length));
  });

  it("does not reveal the explanation before an answer is checked", () => {
    renderQuiz();
    start();

    expect(screen.queryByText(questions[0].explanation)).toBeNull();
    expect(screen.queryByText(`Source: ${questions[0].citation.label}`)).toBeNull();
  });

  it("requires a selection before the answer can be checked", () => {
    renderQuiz();
    start();

    const check = screen.getByRole("button", { name: "Check answer" }) as HTMLButtonElement;
    expect(check.disabled).toBe(true);

    fireEvent.click(screen.getByRole("radio", { name: questions[0].options[0].text }));
    expect((screen.getByRole("button", { name: "Check answer" }) as HTMLButtonElement).disabled).toBe(
      false
    );
  });

  it("confirms a correct answer and shows the grounded explanation", () => {
    renderQuiz();
    start();
    answer(questions[0], questions[0].correctOptionId);

    expect(screen.getByText("Correct")).toBeTruthy();
    expect(screen.getByText(questions[0].explanation)).toBeTruthy();
    expect(screen.getByText(`Source: ${questions[0].citation.label}`)).toBeTruthy();
  });

  it("marks a wrong answer without hiding which option was right", () => {
    renderQuiz();
    start();
    answer(questions[0], wrongOptionFor(questions[0]));

    expect(screen.getByText("Not quite")).toBeTruthy();
    expect(screen.getByLabelText("Correct answer")).toBeTruthy();
    expect(screen.getByLabelText("Your answer, incorrect")).toBeTruthy();
    // The explanation is still shown, because the point is learning.
    expect(screen.getByText(questions[0].explanation)).toBeTruthy();
  });

  it("locks the options once an answer has been checked", () => {
    const { container } = renderQuiz();
    start();

    const radios = () => [...container.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    expect(radios().every((input) => input.disabled)).toBe(false);

    answer(questions[0], questions[0].correctOptionId);

    expect(radios()).toHaveLength(questions[0].options.length);
    expect(radios().every((input) => input.disabled)).toBe(true);
  });

  it("advances through the questions and reports a perfect score", () => {
    renderQuiz();
    start();

    for (let i = 0; i < questions.length; i += 1) {
      answer(questions[i], questions[i].correctOptionId);
      const label = i + 1 >= questions.length ? "See your score" : "Next question";
      fireEvent.click(screen.getByRole("button", { name: new RegExp(label) }));
    }

    expect(screen.getByRole("heading", { name: "Your score" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain(
      `${questions.length} / ${questions.length}`
    );
    expect(screen.getByRole("status").textContent).toContain("100%");
  });

  it("reports a zero score when every answer is wrong", () => {
    renderQuiz();
    start();

    for (let i = 0; i < questions.length; i += 1) {
      answer(questions[i], wrongOptionFor(questions[i]));
      const label = i + 1 >= questions.length ? "See your score" : "Next question";
      fireEvent.click(screen.getByRole("button", { name: new RegExp(label) }));
    }

    expect(screen.getByRole("status").textContent).toContain(`0 / ${questions.length}`);
    expect(screen.getByRole("status").textContent).toContain("0%");
  });

  it("resets the attempt on retry", () => {
    renderQuiz();
    start();

    for (let i = 0; i < questions.length; i += 1) {
      answer(questions[i], wrongOptionFor(questions[i]));
      const label = i + 1 >= questions.length ? "See your score" : "Next question";
      fireEvent.click(screen.getByRole("button", { name: new RegExp(label) }));
    }
    fireEvent.click(screen.getByRole("button", { name: /Try again/ }));

    expect(screen.getByText(new RegExp(`Question 1 of ${questions.length}`))).toBeTruthy();
    expect(screen.getByText("0 correct so far")).toBeTruthy();
    for (const option of questions[0].options) {
      expect((screen.getByRole("radio", { name: option.text }) as HTMLInputElement).checked).toBe(
        false
      );
    }
  });

  it("keeps the general-information caveat visible while answering", () => {
    renderQuiz();
    start();

    expect(
      screen.getByText(/test general legal information, not what you should do in your own/)
    ).toBeTruthy();
  });

  it("shows a scenario above the prompt for a scenario question", () => {
    const scenarioQuestion = questionsForArticle("zero-fir").find((q) => q.format === "scenario")!;
    renderQuiz([scenarioQuestion]);
    start();

    expect(screen.getByText(scenarioQuestion.scenario!)).toBeTruthy();
    expect(screen.getByText(scenarioQuestion.prompt)).toBeTruthy();
  });
});
