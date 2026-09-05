import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Tu dois être connecté pour soutenir une réponse.",
        },
        { status: 401 }
      );
    }

    if (!commentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Identifiant de la réponse manquant.",
        },
        { status: 400 }
      );
    }

    // Try updating likes_count on comments table
    const result = await sql`
      UPDATE comments
      SET likes_count = COALESCE(likes_count, 0) + 1
      WHERE id = ${commentId}
      RETURNING id, likes_count
    `;

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Réponse introuvable.",
        },
        { status: 404 }
      );
    }

    const updatedComment = result[0];

    return NextResponse.json({
      success: true,
      likesCount: Number(updatedComment.likes_count ?? 0),
    });
  } catch (error) {
    console.error("Like comment error:", error);

    // In case likes_count column doesn't exist yet in DB schema, attempt adding column dynamically if missing
    try {
      const errStr = error instanceof Error ? error.message : "";
      if (errStr.includes("likes_count")) {
        await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0`;
        const retryResult = await sql`
          UPDATE comments
          SET likes_count = COALESCE(likes_count, 0) + 1
          WHERE id = ${params}
          RETURNING id, likes_count
        `;
        if (retryResult.length > 0) {
          return NextResponse.json({
            success: true,
            likesCount: Number(retryResult[0].likes_count ?? 0),
          });
        }
      }
    } catch (fallbackErr) {
      console.error("Fallback add column error:", fallbackErr);
    }

    return NextResponse.json(
      {
        success: false,
        message: "Impossible d'aimer cette réponse.",
      },
      { status: 500 }
    );
  }
}
