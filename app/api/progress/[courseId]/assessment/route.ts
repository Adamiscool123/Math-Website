import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MASTERY_TEST_THRESHOLD } from "@/content/assessmentSets";
import { query } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";

const topicResultSchema = z.object({
  topicId: z.string().min(1),
  score: z.number().min(0).max(100),
  totalQuestions: z.number().int().min(1),
  correctAnswers: z.number().int().min(0),
});

const assessmentSchema = z.object({
  assessmentType: z.enum(["unit", "final"]),
  score: z.number().min(0).max(100),
  totalQuestions: z.number().int().min(1),
  correctAnswers: z.number().int().min(0),
  topicResults: z.array(topicResultSchema).min(1),
});

type Context = {
  params: Promise<{ courseId: string }>;
};

export async function POST(request: NextRequest, { params }: Context) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const body = assessmentSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return jsonError("Invalid assessment payload.");

  const { courseId } = await params;
  const data = body.data;

  for (const topic of data.topicResults) {
    const nextTestScore = data.score >= MASTERY_TEST_THRESHOLD && topic.score >= MASTERY_TEST_THRESHOLD ? 100 : Math.min(topic.score, MASTERY_TEST_THRESHOLD - 1);

    await query(
      `INSERT INTO user_progress (user_id, course_id, topic_id, test_attempts, test_best_score, last_updated)
       VALUES ($1, $2, $3, 1, $4, NOW())
       ON CONFLICT (user_id, course_id, topic_id)
       DO UPDATE SET
         test_attempts = user_progress.test_attempts + 1,
         test_best_score = $4,
         last_updated = NOW()`,
      [auth.user.id, courseId, topic.topicId, nextTestScore],
    );
  }

  return NextResponse.json({ success: true });
}
