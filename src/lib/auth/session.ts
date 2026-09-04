import { cookies } from "next/headers";
import crypto from "crypto";
import { sql } from "@/lib/db";

const SESSION_COOKIE = "discutons_session";

const SESSION_DURATION = 1000 * 60 * 60 * 24 * 30; // 30 jours

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function createSession(userId: string) {
  const token = crypto
    .randomBytes(32)
    .toString("hex");

  const tokenHash = hashToken(token);

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION
  );

  await sql`
    DELETE FROM sessions
    WHERE user_id = ${userId}
      AND expires_at < NOW()
  `;

  await sql`
    INSERT INTO sessions (
      user_id,
      token_hash,
      expires_at
    )
    VALUES (
      ${userId},
      ${tokenHash},
      ${expiresAt.toISOString()}
    )
  `;

  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE,
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    }
  );

  return token;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const result = await sql`
    SELECT
      u.id,
      u.email,
      u.username,
      u.role,
      u.is_active,
      u.created_at,
      u.updated_at
    FROM sessions s
    INNER JOIN users u
      ON u.id = s.user_id
    WHERE s.token_hash = ${tokenHash}
      AND s.expires_at > NOW()
      AND u.is_active = TRUE
    LIMIT 1
  `;

  if (result.length === 0) {
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  return result[0];
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function logout() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const tokenHash = hashToken(token);

    await sql`
      DELETE FROM sessions
      WHERE token_hash = ${tokenHash}
    `;
  }

  cookieStore.delete(SESSION_COOKIE);
}
