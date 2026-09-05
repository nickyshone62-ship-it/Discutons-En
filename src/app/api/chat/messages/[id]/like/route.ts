import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Tu dois être connecté pour réagir.",
        },
        { status: 401 }
      );
    }

    if (!messageId) {
      return NextResponse.json(
        {
          success: false,
          message: "Identifiant du message manquant.",
        },
        { status: 400 }
      );
    }

    // Ensure chat_message_likes table exists
    await sql`
      CREATE TABLE IF NOT EXISTS chat_message_likes (
        user_id UUID NOT NULL,
        message_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, message_id)
      )
    `;

    // Ensure likes_count column exists
    await sql`
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0
    `;

    const existingLike = await sql`
      SELECT user_id
      FROM chat_message_likes
      WHERE user_id = ${user.id as string} AND message_id = ${messageId}
      LIMIT 1
    `;

    let liked = false;

    if (existingLike.length > 0) {
      await sql`
        DELETE FROM chat_message_likes
        WHERE user_id = ${user.id as string} AND message_id = ${messageId}
      `;
      await sql`
        UPDATE chat_messages
        SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1)
        WHERE id = ${messageId}
      `;
      liked = false;
    } else {
      await sql`
        INSERT INTO chat_message_likes (user_id, message_id)
        VALUES (${user.id as string}, ${messageId})
        ON CONFLICT (user_id, message_id) DO NOTHING
      `;
      await sql`
        UPDATE chat_messages
        SET likes_count = COALESCE(likes_count, 0) + 1
        WHERE id = ${messageId}
      `;
      liked = true;
    }

    const updated = await sql`
      SELECT likes_count
      FROM chat_messages
      WHERE id = ${messageId}
      LIMIT 1
    `;

    const likesCount = updated.length > 0 ? Number(updated[0].likes_count ?? 0) : 0;

    return NextResponse.json({
      success: true,
      liked,
      likesCount,
    });
  } catch (error) {
    console.error("Toggle chat message like error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Impossible d'enregistrer la réaction.",
      },
      { status: 500 }
    );
  }
}
