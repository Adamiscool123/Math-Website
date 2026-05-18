import { algebra1Course, algebra1Topics } from "@/content/algebra1";
import type { Difficulty, QuestionInstance, QuestionTemplate, Topic, Unit } from "@/content/types";

export const PRACTICE_QUESTION_COUNT = 5;
export const REGULAR_TEST_QUESTION_COUNT = 10;
export const UNIT_TEST_QUESTION_COUNT = 30;
export const ALGEBRA_1_FINAL_TEST_QUESTION_COUNT = 50;
export const MASTERY_TEST_THRESHOLD = 90;

function difficultyOrder(difficulty: Difficulty) {
  if (difficulty === "easy") return 0;
  if (difficulty === "medium") return 1;
  return 2;
}

function shuffled<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function withTopicMeta(question: QuestionInstance, topic: Topic): QuestionInstance {
  return {
    ...question,
    topicId: topic.id,
    unitId: topic.unitId,
    courseId: topic.courseId,
    topicTitle: topic.title,
  };
}

function chooseTemplate(topic: Topic, index: number) {
  const sortedTemplates = [...topic.questionTemplates].sort((a, b) => difficultyOrder(a.difficulty) - difficultyOrder(b.difficulty));
  return sortedTemplates[index % sortedTemplates.length];
}

function generateBalancedAssessment(topics: Topic[], count: number): QuestionInstance[] {
  if (!topics.length) return [];

  const shuffledTopics = shuffled(topics);
  const questions: QuestionInstance[] = [];
  let round = 0;

  while (questions.length < count) {
    for (const topic of shuffledTopics) {
      if (questions.length >= count) break;
      const template = chooseTemplate(topic, round);
      questions.push(withTopicMeta(template.generate(), topic));
    }
    round += 1;
  }

  return questions;
}

export function generateUnitTestSet(unit: Unit, count = UNIT_TEST_QUESTION_COUNT): QuestionInstance[] {
  return generateBalancedAssessment(unit.topics, count);
}

export function generateAlgebra1FinalTestSet(count = ALGEBRA_1_FINAL_TEST_QUESTION_COUNT): QuestionInstance[] {
  return generateBalancedAssessment(algebra1Topics, count);
}

export function buildTopicResults(questions: QuestionInstance[], correctByQuestion: Record<string, boolean>) {
  const grouped: Record<string, { topicId: string; correctAnswers: number; totalQuestions: number }> = {};

  for (const question of questions) {
    if (!question.topicId) continue;
    grouped[question.topicId] ??= { topicId: question.topicId, correctAnswers: 0, totalQuestions: 0 };
    grouped[question.topicId].totalQuestions += 1;
    if (correctByQuestion[question.id]) {
      grouped[question.topicId].correctAnswers += 1;
    }
  }

  return Object.values(grouped).map((row) => ({
    ...row,
    score: row.totalQuestions ? Math.round((row.correctAnswers / row.totalQuestions) * 100) : 0,
  }));
}
