import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";

const testSchema = z.object({
  score: z.number().min(0).max(100),
  totalQuestions: z.number().int().min(0),
  correctAnswers: z.number().int().min(0),
  timeTaken: z.number().int().min(0).nullable(),
  skillBreakdown: z.record(z.string(), z.unknown()),
});

type Context = {
  params: Promise<{ courseId: string; topicId: string }>;
};

export async function POST(request: NextRequest, { params }: Context) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const body = testSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return jsonError("Invalid test payload.");

  const { courseId, topicId } = await params;
  const data = body.data;

  await query(
    `INSERT INTO test_results (user_id, course_id, topic_id, score, total_questions, correct_answers, time_taken, skill_breakdown)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      auth.user.id,
      courseId,
      topicId,
      data.score,
      data.totalQuestions,
      data.correctAnswers,
      data.timeTaken,
      JSON.stringify(data.skillBreakdown),
    ],
  );

  await query(
    `INSERT INTO user_progress (user_id, course_id, topic_id, test_attempts, test_best_score, last_updated)
     VALUES ($1, $2, $3, 1, $4, NOW())
     ON CONFLICT (user_id, course_id, topic_id)
     DO UPDATE SET
       test_attempts = user_progress.test_attempts + 1,
       test_best_score = GREATEST(user_progress.test_best_score, $4),
       last_updated = NOW()`,
    [auth.user.id, courseId, topicId, data.score],
  );

  return NextResponse.json({ success: true });
}
