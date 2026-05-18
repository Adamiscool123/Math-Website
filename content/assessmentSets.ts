import { algebra1Course, algebra1Topics } from "@/content/algebra1";
import type { Difficulty, QuestionInstance, QuestionTemplate, Topic } from "@/content/types";

export const PRACTICE_QUESTION_COUNT = 5;
export const REGULAR_TEST_QUESTION_COUNT = 10;
export const TOPIC_TEST_QUESTION_COUNT = 15;
export const ALGEBRA_1_FINAL_TEST_QUESTION_COUNT = 30;

function difficultyOrder(difficulty: Difficulty) {
  if (difficulty === "easy") return 0;
  if (difficulty === "medium") return 1;
  return 2;
}

function shuffled<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function generateFromTemplates(templates: QuestionTemplate[], count: number) {
  return templates.slice(0, count).map((template) => template.generate());
}

export function generateTopicTestSet(topic: Topic, count = TOPIC_TEST_QUESTION_COUNT): QuestionInstance[] {
  const easy = topic.questionTemplates.filter((template) => template.difficulty === "easy");
  const medium = topic.questionTemplates.filter((template) => template.difficulty === "medium");
  const hard = topic.questionTemplates.filter((template) => template.difficulty === "hard");

  const balancedPool = [
    ...easy.slice(0, 5),
    ...medium.slice(0, 5),
    ...hard.slice(0, 5),
  ];

  return generateFromTemplates(balancedPool, count);
}

export function generateAlgebra1FinalTestSet(count = ALGEBRA_1_FINAL_TEST_QUESTION_COUNT): QuestionInstance[] {
  const topicTemplates = algebra1Course.units.flatMap((unit) =>
    unit.topics.map((topic) => {
      const sortedTemplates = [...topic.questionTemplates].sort((a, b) => difficultyOrder(a.difficulty) - difficultyOrder(b.difficulty));
      return {
        topicId: topic.id,
        templates: sortedTemplates,
      };
    }),
  );

  const firstPass = shuffled(topicTemplates)
    .slice(0, count)
    .map(({ templates }) => templates[Math.min(1, templates.length - 1)]);

  if (firstPass.length >= count) {
    return firstPass.map((template) => template.generate());
  }

  const fallback = algebra1Topics.flatMap((topic) => topic.questionTemplates);
  const remaining = shuffled(fallback).slice(0, count - firstPass.length);

  return [...firstPass, ...remaining].slice(0, count).map((template) => template.generate());
}
