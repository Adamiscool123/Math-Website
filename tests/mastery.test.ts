import { describe, expect, it } from "vitest";
import { algebra1Course } from "@/content/algebra1";
import { calculateCourseMastery, calculateTopicMastery, countMasteredTopics } from "@/lib/mastery";

describe("mastery progress", () => {
  it("combines lesson, practice, and test scores into topic mastery", () => {
    expect(calculateTopicMastery()).toBe(0);
    expect(calculateTopicMastery({ learn_completed: true, practice_best_score: 50, test_best_score: 75 })).toBe(70);
    expect(calculateTopicMastery({ learn_completed: true, practice_best_score: 100, test_best_score: 100 })).toBe(100);
  });

  it("averages topic mastery across the whole Algebra 1 course", () => {
    const firstTopic = algebra1Course.units[0].topics[0];
    const topicCount = algebra1Course.units.reduce((count, unit) => count + unit.topics.length, 0);
    const progress = {
      [firstTopic.id]: {
        learn_completed: true,
        practice_best_score: 100,
        test_best_score: 100,
      },
    };

    expect(countMasteredTopics(algebra1Course, progress)).toBe(1);
    expect(calculateCourseMastery(algebra1Course, progress)).toBe(Math.round(100 / topicCount));
  });
});
