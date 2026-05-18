import { describe, expect, it } from "vitest";
import { algebra1Course, algebra1Topics, generatePracticeSet, generateTestSet, getTopicBySlug } from "@/content/algebra1";
import {
  ALGEBRA_1_FINAL_TEST_QUESTION_COUNT,
  PRACTICE_QUESTION_COUNT,
  REGULAR_TEST_QUESTION_COUNT,
  UNIT_TEST_QUESTION_COUNT,
  buildTopicResults,
  generateAlgebra1FinalTestSet,
  generateUnitTestSet,
} from "@/content/assessmentSets";
import { getEnhancedTopic, isDeepenedTopic } from "@/content/deepAlgebra1";

describe("Algebra 1 content", () => {
  it("ships all planned Algebra 1 units and topics", () => {
    expect(algebra1Course.units).toHaveLength(11);
    expect(algebra1Topics).toHaveLength(54);
  });

  it("gives every topic lessons, goals, formulas, examples, mistakes, mastery checks, and 15 question templates", () => {
    for (const topic of algebra1Topics) {
      expect(topic.objectives.length).toBeGreaterThanOrEqual(3);
      expect(topic.lesson.length).toBeGreaterThanOrEqual(5);
      expect(topic.formulas.length).toBeGreaterThanOrEqual(2);
      expect(topic.examples.length).toBeGreaterThanOrEqual(3);
      expect(topic.commonMistakes.length).toBeGreaterThanOrEqual(3);
      expect(topic.masteryChecks.length).toBeGreaterThanOrEqual(3);
      expect(topic.questionTemplates).toHaveLength(15);
      expect(topic.questionTemplates.filter((template) => template.difficulty === "easy")).toHaveLength(5);
      expect(topic.questionTemplates.filter((template) => template.difficulty === "medium")).toHaveLength(5);
      expect(topic.questionTemplates.filter((template) => template.difficulty === "hard")).toHaveLength(5);
    }
  });

  it("deepens every Foundations topic with richer lessons and specific question types", () => {
    const foundationSlugs = ["order-of-operations", "properties-of-real-numbers", "evaluating-expressions", "writing-expressions"];

    for (const slug of foundationSlugs) {
      const topic = getTopicBySlug(slug);
      expect(topic).toBeTruthy();
      const enhanced = getEnhancedTopic(topic!);
      const sampleQuestions = enhanced.questionTemplates.map((template) => template.generate());

      expect(isDeepenedTopic(slug)).toBe(true);
      expect(enhanced.lesson.length).toBeGreaterThanOrEqual(6);
      expect(enhanced.commonMistakes.length).toBeGreaterThanOrEqual(5);
      expect(enhanced.objectives.length).toBeGreaterThanOrEqual(4);
      expect(enhanced.questionTemplates).toHaveLength(15);
      expect(new Set(sampleQuestions.map((question) => question.skill)).size).toBeGreaterThanOrEqual(3);
      expect(sampleQuestions.some((question) => question.type === "multiple-choice" || question.type === "expression-input" || question.type === "numeric-input")).toBe(true);
    }
  });

  it("generates complete practice and regular topic test questions", () => {
    const topic = getEnhancedTopic(algebra1Topics[0]);
    const practice = generatePracticeSet(topic, "easy");
    const test = generateTestSet(topic);

    expect(practice).toHaveLength(PRACTICE_QUESTION_COUNT);
    expect(test).toHaveLength(REGULAR_TEST_QUESTION_COUNT);
    for (const question of [...practice, ...test]) {
      expect(question.prompt).toBeTruthy();
      expect(question.acceptedAnswers.length).toBeGreaterThan(0);
      expect(question.hints).toHaveLength(3);
      expect(question.solution.length).toBeGreaterThanOrEqual(3);
      expect(question.skill).toBeTruthy();
    }
  });

  it("generates 30 question unit tests and a 50 question Algebra 1 final mastery test", () => {
    const unitTest = generateUnitTestSet(algebra1Course.units[0]);
    const finalTest = generateAlgebra1FinalTestSet();

    expect(unitTest).toHaveLength(UNIT_TEST_QUESTION_COUNT);
    expect(finalTest).toHaveLength(ALGEBRA_1_FINAL_TEST_QUESTION_COUNT);
    for (const question of [...unitTest, ...finalTest]) {
      expect(question.prompt).toBeTruthy();
      expect(question.topicId).toBeTruthy();
      expect(question.topicTitle).toBeTruthy();
      expect(question.acceptedAnswers.length).toBeGreaterThan(0);
      expect(question.solution.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("builds per-topic assessment results for mastery downgrades", () => {
    const unitTest = generateUnitTestSet(algebra1Course.units[0]);
    const correctByQuestion = Object.fromEntries(unitTest.map((question, index) => [question.id, index % 2 === 0]));
    const results = buildTopicResults(unitTest, correctByQuestion);

    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(result.topicId).toBeTruthy();
      expect(result.totalQuestions).toBeGreaterThan(0);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    }
  });

  it("does not generate duplicate multiple-choice options", () => {
    for (const topic of algebra1Topics.map(getEnhancedTopic)) {
      for (const template of topic.questionTemplates) {
        for (let attempt = 0; attempt < 20; attempt += 1) {
          const question = template.generate();
          if (!question.choices) continue;

          expect(new Set(question.choices).size).toBe(question.choices.length);
          expect(question.choices).toContain(question.acceptedAnswers[0]);
        }
      }
    }
  });
});
