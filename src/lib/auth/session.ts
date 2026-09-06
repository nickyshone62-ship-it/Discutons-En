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

export async function ensureDefaultAdmin() {
  try {
    const adminEmail = "epiphane920@gmail.com";
    const adminUsername = "epiphane";
    const adminPassword = "epi@003";

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        first_name TEXT,
        last_name TEXT,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'USER',
        is_active BOOLEAN DEFAULT TRUE,
        is_approved BOOLEAN DEFAULT FALSE,
        approval_status TEXT DEFAULT 'PENDING',
        payment_method TEXT,
        payment_phone TEXT,
        payment_ref TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const existingAdmin = await sql`
      SELECT id, password_hash, role, is_approved
      FROM users
      WHERE email = ${adminEmail} OR username = ${adminUsername}
      LIMIT 1
    `;

    const { hashPassword, verifyPassword } = await import("./password");
    const { getOrCreateAnonymousIdentity } = await import("@/lib/anonymous");

    const passwordHash = await hashPassword(adminPassword);

    if (existingAdmin.length === 0) {
      const insertedUsers = await sql`
        INSERT INTO users (
          email,
          username,
          first_name,
          last_name,
          password_hash,
          role,
          is_active,
          is_approved,
          approval_status
        )
        VALUES (
          ${adminEmail},
          ${adminUsername},
          'Epiphane',
          'Admin',
          ${passwordHash},
          'ADMIN',
          TRUE,
          TRUE,
          'APPROVED'
        )
        RETURNING id
      `;

      if (insertedUsers.length > 0) {
        await getOrCreateAnonymousIdentity(insertedUsers[0].id as string, "lorelei_1");
      }
    } else {
      const adminUser = existingAdmin[0];
      const isPasswordValid = await verifyPassword(adminPassword, adminUser.password_hash as string);

      if (!isPasswordValid || adminUser.role !== "ADMIN" || !adminUser.is_approved) {
        await sql`
          UPDATE users
          SET
            email = ${adminEmail},
            role = 'ADMIN',
            is_active = TRUE,
            is_approved = TRUE,
            approval_status = 'APPROVED',
            password_hash = ${passwordHash},
            updated_at = NOW()
          WHERE id = ${adminUser.id as string}
        `;
      }
    }
  } catch (error) {
    console.error("Ensure default admin error:", error);
  }
}

