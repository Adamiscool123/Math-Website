import { describe, expect, it } from "vitest";
import { algebra1Course, algebra1Topics, generatePracticeSet, generateTestSet } from "@/content/algebra1";

describe("Algebra 1 content", () => {
  it("ships all planned Algebra 1 units and topics", () => {
    expect(algebra1Course.units).toHaveLength(10);
    expect(algebra1Topics.length).toBeGreaterThanOrEqual(40);
  });

  it("gives every topic lessons, formulas, examples, mistakes, and 15 question templates", () => {
    for (const topic of algebra1Topics) {
      expect(topic.lesson.length).toBeGreaterThanOrEqual(3);
      expect(topic.formulas.length).toBeGreaterThanOrEqual(2);
      expect(topic.examples.length).toBeGreaterThanOrEqual(3);
      expect(topic.commonMistakes.length).toBeGreaterThanOrEqual(3);
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
});
