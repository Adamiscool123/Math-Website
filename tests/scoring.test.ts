import { describe, expect, it } from "vitest";
import type { QuestionInstance, QuestionType } from "@/content/types";
import { checkAnswer, reviewRecommendations, scoreQuestions } from "@/lib/scoring";

const question = (id: string, skill: string, answer: string, type: QuestionType = "free-response"): QuestionInstance => ({
  id,
  type,
  difficulty: "easy",
  skill,
  prompt: "Solve.",
  acceptedAnswers: [answer],
  hints: ["hint 1", "hint 2", "hint 3"],
  solution: ["step 1"],
});

describe("scoring", () => {
  it("normalizes simple algebra answers", () => {
    expect(checkAnswer(question("q1", "equations", "x<3"), " x < 3 ")).toBe(true);
    expect(checkAnswer(question("q2", "equations", "-4"), "−4")).toBe(true);
  });

  it("supports numeric-input answers", () => {
    expect(checkAnswer(question("q1", "numeric", "4", "numeric-input"), "4.0")).toBe(true);
    expect(checkAnswer(question("q2", "numeric", "-12", "numeric-input"), "−12")).toBe(true);
    expect(checkAnswer(question("q3", "numeric", "5", "numeric-input"), "5x")).toBe(false);
  });

  it("supports expression-input answers for future algebra and calculus problems", () => {
    expect(checkAnswer(question("q1", "derivatives", "2x", "expression-input"), "2*x")).toBe(true);
    expect(checkAnswer(question("q2", "derivatives", "2x", "expression-input"), "2x^1")).toBe(true);
    expect(checkAnswer(question("q3", "derivatives", "x", "expression-input"), "1x")).toBe(true);
    expect(checkAnswer(question("q4", "derivatives", "-x", "expression-input"), "-1x")).toBe(true);
  });

  it("supports equation-input answers", () => {
    expect(checkAnswer(question("q1", "linear equations", "y=2x+1", "equation-input"), "y = 2*x + 1")).toBe(true);
    expect(checkAnswer(question("q2", "linear equations", "y=2x+1", "equation-input"), "2x+1=y")).toBe(true);
  });

  it("scores questions and builds skill breakdowns", () => {
    const result = scoreQuestions(
      [question("q1", "linear", "2"), question("q2", "linear", "5"), question("q3", "quadratic", "7")],
      { q1: "2", q2: "wrong", q3: "7" },
    );

    expect(result.score).toBe(67);
    expect(result.correct).toBe(2);
    expect(result.skillBreakdown.linear.score).toBe(50);
    expect(result.skillBreakdown.quadratic.score).toBe(100);
  });

  it("recommends weak skills", () => {
    expect(reviewRecommendations({ linear: { score: 50 }, quadratic: { score: 100 } })).toEqual(["Review linear before the next test."]);
  });
});
