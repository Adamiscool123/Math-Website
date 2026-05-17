import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ courseId: string; topicId: string }>;
};

export async function GET(_request: Request, { params }: Context) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { courseId, topicId } = await params;
  const tests = await query(
    `SELECT *
     FROM test_results
     WHERE user_id = $1
       AND course_id = $2
       AND topic_id = $3
     ORDER BY created_at DESC
     LIMIT 10`,
    [auth.user.id, courseId, topicId],
  );
  const practice = await query(
    `SELECT *
     FROM practice_sessions
     WHERE user_id = $1
       AND course_id = $2
       AND topic_id = $3
     ORDER BY created_at DESC
     LIMIT 10`,
    [auth.user.id, courseId, topicId],
  );

  return NextResponse.json({ tests: tests.rows, practice: practice.rows });
}
