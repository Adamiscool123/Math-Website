import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { jsonError, normalizeEmail } from "@/lib/http";
import { createSession, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

const PASSWORD_HASH_ROUNDS = 10;

const signupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(6).max(200),
});

type UserRow = {
  id: string;
  name: string;
  email: string;
};

export async function POST(request: NextRequest) {
  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError("Enter a valid name, email, and password of at least 6 characters.");
  }

  const name = parsed.data.name.trim();
  const email = normalizeEmail(parsed.data.email);
  const passwordHash = await bcrypt.hash(parsed.data.password, PASSWORD_HASH_ROUNDS);

  try {
    const exists = await query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
    if (exists.rowCount) {
      return jsonError("An account with that email already exists.", 409);
    }

    const result = await query<UserRow>(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, passwordHash],
    );
    const user = result.rows[0];
    const session = await createSession(user.id);
    const response = NextResponse.json({ user });
    setSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    console.error(error);
    return jsonError("Server error. Please try again.", 500);
  }
}
