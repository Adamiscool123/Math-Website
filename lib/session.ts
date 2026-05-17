import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const SESSION_COOKIE = "matheye_session";
const SESSION_DAYS = 30;

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error("SESSION_SECRET must be set to at least 24 characters.");
  }
  return secret;
}

export function hashSessionToken(token: string) {
  return crypto.createHmac("sha256", getSecret()).update(token).digest("hex");
}

export function createRawSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function sessionExpiry() {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export async function createSession(userId: string) {
  const token = createRawSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = sessionExpiry();

  await query(
    `INSERT INTO sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );

  return { token, expiresAt };
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const result = await query<CurrentUser>(
    `SELECT users.id, users.name, users.email
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = $1
       AND sessions.expires_at > NOW()
       AND sessions.revoked_at IS NULL
     LIMIT 1`,
    [tokenHash],
  );

  return result.rows[0] ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  }
  return { user, error: null };
}

export async function revokeCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return;

  await query(
    `UPDATE sessions
     SET revoked_at = NOW()
     WHERE token_hash = $1
       AND revoked_at IS NULL`,
    [hashSessionToken(token)],
  );
}
