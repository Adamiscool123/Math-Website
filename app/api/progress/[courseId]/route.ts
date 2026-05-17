import { NextResponse } from "next/server";
import { getCourseProgress } from "@/lib/progress";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ courseId: string }>;
};

export async function GET(_request: Request, { params }: Context) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { courseId } = await params;
  const progress = await getCourseProgress(auth.user.id, courseId);
  return NextResponse.json({ progress });
}
