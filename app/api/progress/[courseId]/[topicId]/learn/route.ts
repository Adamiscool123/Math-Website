import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ courseId: string; topicId: string }>;
};

export async function POST(_request: Request, { params }: Context) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { courseId, topicId } = await params;
  await query(
    `INSERT INTO user_progress (user_id, course_id, topic_id, learn_completed, last_updated)
     VALUES ($1, $2, $3, TRUE, NOW())
     ON CONFLICT (user_id, course_id, topic_id)
     DO UPDATE SET learn_completed = TRUE, last_updated = NOW()`,
    [auth.user.id, courseId, topicId],
  );

  return NextResponse.json({ success: true });
}
