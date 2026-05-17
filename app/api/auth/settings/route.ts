import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { requireUser } from "@/lib/session";

export const runtime = "nodejs";

const PASSWORD_HASH_ROUNDS = 10;

const settingsSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(6).max(200).optional(),
  })
  .refine((data) => data.name !== undefined || data.newPassword !== undefined, {
    message: "No settings were provided.",
  })
  .refine((data) => !data.newPassword || data.currentPassword, {
    message: "Current password is required.",
  });

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
};

export async function PATCH(request: NextRequest) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid settings payload.");
  }

  try {
    const result = await query<UserRow>("SELECT id, name, email, password_hash FROM users WHERE id = $1 LIMIT 1", [auth.user.id]);
    const user = result.rows[0];
    if (!user) {
      return jsonError("User not found.", 404);
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    if (parsed.data.name !== undefined) {
      values.push(parsed.data.name.trim());
      updates.push(`name = $${values.length}`);
    }

    if (parsed.data.newPassword) {
      const validPassword = await bcrypt.compare(parsed.data.currentPassword ?? "", user.password_hash);
      if (!validPassword) {
        return jsonError("Current password is incorrect.", 401);
      }
      values.push(await bcrypt.hash(parsed.data.newPassword, PASSWORD_HASH_ROUNDS));
      updates.push(`password_hash = $${values.length}`);
    }

    if (!updates.length) {
      return jsonError("No settings were provided.");
    }

    values.push(user.id);
    const updated = await query<UserRow>(
      `UPDATE users
       SET ${updates.join(", ")}
       WHERE id = $${values.length}
       RETURNING id, name, email, password_hash`,
      values,
    );

    const updatedUser = updated.rows[0];
    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    return jsonError("Server error. Please try again.", 500);
  }
}
