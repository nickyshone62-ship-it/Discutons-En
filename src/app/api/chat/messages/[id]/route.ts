import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function PATCH(
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
          message: "Tu dois être connecté pour modifier un message.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content || content.length < 1 || content.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message: "Le message modifié doit contenir entre 1 et 1000 caractères.",
        },
        { status: 400 }
      );
    }

    // Ensure is_edited column exists
    await sql`
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE
    `;

    // Verify ownership and update
    const updated = await sql`
      UPDATE chat_messages
      SET content = ${content}, is_edited = TRUE
      WHERE id = ${messageId} AND user_id = ${user.id as string}
      RETURNING id, content, is_edited, created_at
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Impossible de modifier ce message (non trouvé ou non autorisé).",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: updated[0],
    });
  } catch (error) {
    console.error("Edit message error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue lors de la modification.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
          message: "Tu dois être connecté pour supprimer un message.",
        },
        { status: 401 }
      );
    }

    // Verify ownership and delete
    const deleted = await sql`
      DELETE FROM chat_messages
      WHERE id = ${messageId} AND user_id = ${user.id as string}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Impossible de supprimer ce message (non trouvé ou non autorisé).",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId,
    });
  } catch (error) {
    console.error("Delete message error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue lors de la suppression.",
      },
      { status: 500 }
    );
  }
}
