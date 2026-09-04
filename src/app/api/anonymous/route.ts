import { NextResponse } from "next/server";
import {
  getCurrentUser,
} from "@/lib/auth/session";

import {
  getOrCreateAnonymousIdentity,
} from "@/lib/anonymous";

import {
  getAvatarUrl,
} from "@/lib/anonymous";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Utilisateur non connecté.",
        },
        {
          status: 401,
        }
      );
    }

    const identity =
      await getOrCreateAnonymousIdentity(
        user.id as string
      );

    const avatarUrl = getAvatarUrl(
      identity.avatar_seed,
      identity.anonymous_name
    );

    return NextResponse.json({
      success: true,
      identity: {
        id: identity.id,
        anonymousName:
          identity.anonymous_name,
        avatarSeed:
          identity.avatar_seed,
        avatarUrl,
      },
    });
  } catch (error) {
    console.error(
      "Anonymous identity error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Impossible de récupérer l'identité anonyme.",
      },
      {
        status: 500,
      }
    );
  }
}
