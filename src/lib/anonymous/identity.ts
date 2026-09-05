import crypto from "crypto";
import { sql } from "@/lib/db";

export type AnonymousIdentity = {
  id: string;
  user_id: string;
  anonymous_name: string;
  avatar_seed: string;
};

function generateAnonymousName() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 4; i++) {
    const index = crypto.randomInt(0, characters.length);
    code += characters[index];
  }

  return `Membre-${code}`;
}

function generateAvatarSeed() {
  return crypto.randomBytes(16).toString("hex");
}

export async function createAnonymousIdentity(
  userId: string,
  customAvatarSeed?: string
): Promise<AnonymousIdentity> {
  const existing = await sql`
    SELECT
      id,
      user_id,
      anonymous_name,
      avatar_seed
    FROM anonymous_identities
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  if (existing.length > 0) {
    return existing[0] as AnonymousIdentity;
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    const anonymousName = generateAnonymousName();
    const avatarSeed = customAvatarSeed && customAvatarSeed.trim() ? customAvatarSeed.trim() : generateAvatarSeed();

    try {
      const result = await sql`
        INSERT INTO anonymous_identities (
          user_id,
          anonymous_name,
          avatar_seed
        )
        VALUES (
          ${userId},
          ${anonymousName},
          ${avatarSeed}
        )
        RETURNING
          id,
          user_id,
          anonymous_name,
          avatar_seed
      `;

      return result[0] as AnonymousIdentity;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "";

      if (
        message.toLowerCase().includes("unique")
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    "Impossible de créer une identité anonyme."
  );
}

export async function getAnonymousIdentity(
  userId: string
): Promise<AnonymousIdentity | null> {
  const result = await sql`
    SELECT
      id,
      user_id,
      anonymous_name,
      avatar_seed
    FROM anonymous_identities
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  if (result.length === 0) {
    return null;
  }

  return result[0] as AnonymousIdentity;
}

export async function getOrCreateAnonymousIdentity(
  userId: string,
  customAvatarSeed?: string
): Promise<AnonymousIdentity> {
  const existing =
    await getAnonymousIdentity(userId);

  if (existing) {
    return existing;
  }

  return createAnonymousIdentity(userId, customAvatarSeed);
}

