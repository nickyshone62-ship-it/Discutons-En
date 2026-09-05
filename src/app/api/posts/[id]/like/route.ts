import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Tu dois être connecté pour aimer une discussion.",
        },
        { status: 401 }
      );
    }

    if (!postId) {
      return NextResponse.json(
        {
          success: false,
          message: "Identifiant du problème manquant.",
        },
        { status: 400 }
      );
    }

    // Ensure post_likes table exists
    await sql`
      CREATE TABLE IF NOT EXISTS post_likes (
        user_id UUID NOT NULL,
        post_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id)
      )
    `;

    // Check if user already liked this post
    const existingLike = await sql`
      SELECT user_id
      FROM post_likes
      WHERE user_id = ${user.id as string} AND post_id = ${postId}
      LIMIT 1
    `;

    let liked = false;

    if (existingLike.length > 0) {
      // Remove like
      await sql`
        DELETE FROM post_likes
        WHERE user_id = ${user.id as string} AND post_id = ${postId}
      `;
      await sql`
        UPDATE posts
        SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1)
        WHERE id = ${postId}
      `;
      liked = false;
    } else {
      // Add like
      await sql`
        INSERT INTO post_likes (user_id, post_id)
        VALUES (${user.id as string}, ${postId})
        ON CONFLICT (user_id, post_id) DO NOTHING
      `;
      await sql`
        UPDATE posts
        SET likes_count = COALESCE(likes_count, 0) + 1
        WHERE id = ${postId}
      `;
      liked = true;
    }

    // Fetch updated likes count
    const updatedPost = await sql`
      SELECT likes_count
      FROM posts
      WHERE id = ${postId}
      LIMIT 1
    `;

    const likesCount = updatedPost.length > 0 ? Number(updatedPost[0].likes_count ?? 0) : 0;

    return NextResponse.json({
      success: true,
      liked,
      likesCount,
    });
  } catch (error) {
    console.error("Toggle post like error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Impossible d'enregistrer votre mention j'aime.",
      },
      { status: 500 }
    );
  }
}
