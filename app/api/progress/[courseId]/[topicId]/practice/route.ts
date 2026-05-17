import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";

const practiceSchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]),
  score: z.number().min(0).max(100),
  questionsAttempted: z.number().int().min(0),
  questionsCorrect: z.number().int().min(0),
});

type Context = {
  params: Promise<{ courseId: string; topicId: string }>;
};

export async function POST(request: NextRequest, { params }: Context) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const body = practiceSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return jsonError("Invalid practice payload.");

  const { courseId, topicId } = await params;
  const data = body.data;

  await query(
    `INSERT INTO practice_sessions (user_id, course_id, topic_id, difficulty, score, questions_attempted, questions_correct)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [auth.user.id, courseId, topicId, data.difficulty, data.score, data.questionsAttempted, data.questionsCorrect],
  );

  await query(
    `INSERT INTO user_progress (user_id, course_id, topic_id, practice_attempts, practice_best_score, last_updated)
     VALUES ($1, $2, $3, 1, $4, NOW())
     ON CONFLICT (user_id, course_id, topic_id)
     DO UPDATE SET
       practice_attempts = user_progress.practice_attempts + 1,
       practice_best_score = GREATEST(user_progress.practice_best_score, $4),
       last_updated = NOW()`,
    [auth.user.id, courseId, topicId, data.score],
  );

  return NextResponse.json({ success: true });
}
