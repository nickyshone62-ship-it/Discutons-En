import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getOrCreateAnonymousIdentity,
  getAvatarUrl,
} from "@/lib/anonymous";
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
          message: "Tu dois être connecté pour répondre à cette discussion.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content || content.length < 2 || content.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: "Le commentaire doit contenir entre 2 et 2000 caractères.",
        },
        { status: 400 }
      );
    }

    // Check if post exists
    const posts = await sql`
      SELECT id
      FROM posts
      WHERE id = ${postId} AND status = 'PUBLISHED'
      LIMIT 1
    `;

    if (posts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "La discussion demandée n'existe pas.",
        },
        { status: 404 }
      );
    }

    // Insert comment
    const comments = await sql`
      INSERT INTO comments (
        post_id,
        user_id,
        content
      )
      VALUES (
        ${postId},
        ${user.id as string},
        ${content}
      )
      RETURNING id, content, created_at
    `;

    if (comments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Impossible d'ajouter votre réponse.",
        },
        { status: 500 }
      );
    }

    // Increment comments count on post
    await sql`
      UPDATE posts
      SET comments_count = COALESCE(comments_count, 0) + 1
      WHERE id = ${postId}
    `;

    const identity = await getOrCreateAnonymousIdentity(user.id as string);
    const newComment = comments[0];

    return NextResponse.json({
      success: true,
      message: "Réponse ajoutée avec succès !",
      comment: {
        id: newComment.id,
        content: newComment.content,
        createdAt: newComment.created_at,
        author: {
          anonymousName: identity.anonymous_name,
          avatarUrl: getAvatarUrl(
            identity.avatar_seed,
            identity.anonymous_name
          ),
        },
      },
    });
  } catch (error) {
    console.error("Add comment error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue lors de l'ajout de la réponse.",
      },
      { status: 500 }
    );
  }
}
