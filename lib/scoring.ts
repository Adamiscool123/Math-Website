import type { QuestionInstance } from "@/content/types";

export function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[−–—]/g, "-");
}

export function normalizeMathExpression(value: string) {
  return normalizeAnswer(value)
    .replace(/\*\*/g, "^")
    .replace(/[·×]/g, "*")
    .replace(/\\cdot/g, "*")
    .replace(/\*/g, "")
    .replace(/\^1(?!\d)/g, "")
    .replace(/\b1([a-z])/g, "$1")
    .replace(/-1([a-z])/g, "-$1")
    .replace(/^\+/, "");
}

function parseNumeric(value: string) {
  const normalized = normalizeAnswer(value).replace(/,/g, "");
  if (!/^[-+]?\d+(\.\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function equivalentNumber(answer: string, submitted: string) {
  const expected = parseNumeric(answer);
  const actual = parseNumeric(submitted);
  if (expected == null || actual == null) return false;
  return Math.abs(expected - actual) < 1e-9;
}

function equivalentEquation(answer: string, submitted: string) {
  const expectedParts = answer.split("=");
  const actualParts = submitted.split("=");
  if (expectedParts.length !== 2 || actualParts.length !== 2) return false;

  const [expectedLeft, expectedRight] = expectedParts.map(normalizeMathExpression);
  const [actualLeft, actualRight] = actualParts.map(normalizeMathExpression);

  return (expectedLeft === actualLeft && expectedRight === actualRight) || (expectedLeft === actualRight && expectedRight === actualLeft);
}

export function checkAnswer(question: QuestionInstance, rawAnswer: string) {
  const submitted = normalizeAnswer(rawAnswer);
  if (!submitted) return false;

  return question.acceptedAnswers.some((answer) => {
    if (question.type === "numeric-input") {
      return equivalentNumber(answer, submitted) || normalizeAnswer(answer) === submitted;
    }

    if (question.type === "expression-input") {
      return normalizeMathExpression(answer) === normalizeMathExpression(submitted);
    }

    if (question.type === "equation-input") {
      return equivalentEquation(answer, submitted) || normalizeMathExpression(answer) === normalizeMathExpression(submitted);
    }

    if (question.type === "multiple-choice") {
      return normalizeAnswer(answer) === submitted;
    }

    return normalizeAnswer(answer) === submitted || normalizeMathExpression(answer) === normalizeMathExpression(submitted);
  });
}

export function scoreQuestions(questions: QuestionInstance[], answers: Record<string, string>) {
  const correctByQuestion = Object.fromEntries(
    questions.map((question) => [question.id, checkAnswer(question, answers[question.id] ?? "")]),
  );
  const correct = Object.values(correctByQuestion).filter(Boolean).length;
  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;

  return {
    score,
    correct,
    total: questions.length,
    correctByQuestion,
    skillBreakdown: buildSkillBreakdown(questions, correctByQuestion),
  };
}

export function buildSkillBreakdown(
  questions: QuestionInstance[],
  correctByQuestion: Record<string, boolean>,
) {
  const map: Record<string, { correct: number; total: number; score: number }> = {};

  for (const question of questions) {
    map[question.skill] ??= { correct: 0, total: 0, score: 0 };
    map[question.skill].total += 1;
    if (correctByQuestion[question.id]) {
      map[question.skill].correct += 1;
    }
  }

  for (const skill of Object.keys(map)) {
    map[skill].score = Math.round((map[skill].correct / map[skill].total) * 100);
  }

  return map;
}

export function reviewRecommendations(skillBreakdown: Record<string, { score: number }>) {
  const weakSkills = Object.entries(skillBreakdown)
    .filter(([, value]) => value.score < 80)
    .sort((a, b) => a[1].score - b[1].score)
    .map(([skill]) => skill);

  if (!weakSkills.length) {
    return ["Keep practicing mixed problems to maintain accuracy under time pressure."];
  }

  return weakSkills.map((skill) => `Review ${skill} before the next test.`);
}
