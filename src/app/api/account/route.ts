import { NextResponse } from "next/server";
import { getCurrentUser, logout } from "@/lib/auth";
import {
  getOrCreateAnonymousIdentity,
  getAvatarUrl,
} from "@/lib/anonymous";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Utilisateur non connecté.",
        },
        { status: 401 }
      );
    }

    const identity = await getOrCreateAnonymousIdentity(user.id as string);

    // Get statistics
    const postCountResult = await sql`
      SELECT COUNT(*) AS count
      FROM posts
      WHERE user_id = ${user.id as string}
    `;

    const commentCountResult = await sql`
      SELECT COUNT(*) AS count
      FROM comments
      WHERE user_id = ${user.id as string}
    `;

    return NextResponse.json({
      success: true,
      account: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
      identity: {
        anonymousName: identity.anonymous_name,
        avatarUrl: getAvatarUrl(
          identity.avatar_seed,
          identity.anonymous_name
        ),
      },
      stats: {
        postsCount: Number(postCountResult[0]?.count ?? 0),
        commentsCount: Number(commentCountResult[0]?.count ?? 0),
      },
    });
  } catch (error) {
    console.error("Get account info error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Impossible de charger les informations de votre compte.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Utilisateur non connecté.",
        },
        { status: 401 }
      );
    }

    const userId = user.id as string;

    // Delete user related data across tables
    await sql`DELETE FROM chat_messages WHERE user_id = ${userId}`;
    await sql`DELETE FROM comments WHERE user_id = ${userId}`;
    await sql`DELETE FROM posts WHERE user_id = ${userId}`;
    await sql`DELETE FROM post_likes WHERE user_id = ${userId}`;
    await sql`DELETE FROM comment_likes WHERE user_id = ${userId}`;
    await sql`DELETE FROM post_views WHERE user_id = ${userId}`;
    await sql`DELETE FROM anonymous_identities WHERE user_id = ${userId}`;
    await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
    await sql`DELETE FROM users WHERE id = ${userId}`;

    // Clear session cookie
    await logout();

    return NextResponse.json({
      success: true,
      message: "Votre compte a été entièrement supprimé.",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue lors de la suppression du compte.",
      },
      { status: 500 }
    );
  }
}
