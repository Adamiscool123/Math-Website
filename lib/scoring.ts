import type { QuestionInstance } from "@/content/types";

export function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/−/g, "-");
}

export function checkAnswer(question: QuestionInstance, rawAnswer: string) {
  const submitted = normalizeAnswer(rawAnswer);
  if (!submitted) return false;

  return question.acceptedAnswers.some((answer) => normalizeAnswer(answer) === submitted);
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
