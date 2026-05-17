import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { jsonError, normalizeEmail } from "@/lib/http";
import { createSession, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
};

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError("Email and password are required.");
  }

  try {
    const result = await query<UserRow>("SELECT id, name, email, password_hash FROM users WHERE email = $1 LIMIT 1", [
      normalizeEmail(parsed.data.email),
    ]);
    const user = result.rows[0];
    if (!user) {
      return jsonError("Invalid email or password.", 401);
    }

    const valid = await bcrypt.compare(parsed.data.password, user.password_hash);
    if (!valid) {
      return jsonError("Invalid email or password.", 401);
    }

    const session = await createSession(user.id);
    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    console.error(error);
    return jsonError("Server error. Please try again.", 500);
  }
}
