import type { Course, Unit } from "@/content/types";

export type MasteryProgress = {
  learn_completed?: boolean | null;
  practice_best_score?: number | null;
  test_best_score?: number | null;
};

export type MasteryProgressMap = Record<string, MasteryProgress | undefined>;

function clampScore(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function calculateTopicMastery(progress?: MasteryProgress | null) {
  if (!progress) return 0;

  const lesson = progress.learn_completed ? 20 : 0;
  const practice = clampScore(progress.practice_best_score) * 0.4;
  const test = clampScore(progress.test_best_score) * 0.4;

  return Math.round(lesson + practice + test);
}

export function calculateUnitMastery(unit: Unit, progress: MasteryProgressMap) {
  if (!unit.topics.length) return 0;
  const total = unit.topics.reduce((sum, topic) => sum + calculateTopicMastery(progress[topic.id]), 0);
  return Math.round(total / unit.topics.length);
}

export function calculateCourseMastery(course: Course, progress: MasteryProgressMap) {
  const topics = course.units.flatMap((unit) => unit.topics);
  if (!topics.length) return 0;
  const total = topics.reduce((sum, topic) => sum + calculateTopicMastery(progress[topic.id]), 0);
  return Math.round(total / topics.length);
}

export function countMasteredTopics(course: Course, progress: MasteryProgressMap) {
  return course.units.flatMap((unit) => unit.topics).filter((topic) => calculateTopicMastery(progress[topic.id]) >= 100).length;
}
