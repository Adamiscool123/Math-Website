import { NextResponse } from "next/server";
import { clearSessionCookie, revokeCurrentSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  await revokeCurrentSession();
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
