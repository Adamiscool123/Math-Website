import { describe, expect, it } from "vitest";
import { algebra1Course, algebra1Topics, generatePracticeSet, generateTestSet } from "@/content/algebra1";

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

  it("generates complete practice and test questions", () => {
    const topic = algebra1Topics[0];
    const practice = generatePracticeSet(topic, "easy");
    const test = generateTestSet(topic);

    expect(practice).toHaveLength(5);
    expect(test).toHaveLength(10);
    for (const question of [...practice, ...test]) {
      expect(question.prompt).toBeTruthy();
      expect(question.acceptedAnswers.length).toBeGreaterThan(0);
      expect(question.hints).toHaveLength(3);
      expect(question.solution.length).toBeGreaterThanOrEqual(3);
      expect(question.skill).toContain(topic.title);
    }
  });

  it("does not generate duplicate multiple-choice options", () => {
    for (const topic of algebra1Topics) {
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
