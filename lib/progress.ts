import { query } from "@/lib/db";

export type ProgressRow = {
  id: string;
  user_id: string;
  course_id: string;
  topic_id: string;
  learn_completed: boolean;
  practice_attempts: number;
  practice_best_score: number;
  test_attempts: number;
  test_best_score: number;
  last_updated: string;
};

export async function getCourseProgress(userId: string, courseId: string) {
  const result = await query<ProgressRow>(
    `SELECT *
     FROM user_progress
     WHERE user_id = $1
       AND course_id = $2`,
    [userId, courseId],
  );

  return Object.fromEntries(result.rows.map((row) => [row.topic_id, row]));
}

export async function getTopicProgress(userId: string, courseId: string, topicId: string) {
  const result = await query<ProgressRow>(
    `SELECT *
     FROM user_progress
     WHERE user_id = $1
       AND course_id = $2
       AND topic_id = $3
     LIMIT 1`,
    [userId, courseId, topicId],
  );

  return result.rows[0] ?? null;
}
