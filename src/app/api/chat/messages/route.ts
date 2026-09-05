import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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

    // Ensure table chat_messages exists
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const identity = await getOrCreateAnonymousIdentity(user.id as string);

    // Fetch the 50 most recent chat messages
    const messages = await sql`
      SELECT
        cm.id,
        cm.user_id,
        cm.content,
        cm.created_at,
        ai.anonymous_name,
        ai.avatar_seed
      FROM chat_messages cm
      INNER JOIN anonymous_identities ai
        ON ai.user_id = cm.user_id
      ORDER BY cm.created_at ASC
      LIMIT 50
    `;

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      userId: msg.user_id,
      content: msg.content,
      createdAt: msg.created_at,
      isMe: msg.user_id === user.id,
      author: {
        anonymousName: msg.anonymous_name,
        avatarUrl: getAvatarUrl(
          msg.avatar_seed as string,
          msg.anonymous_name as string
        ),
      },
    }));

    return NextResponse.json({
      success: true,
      currentUser: {
        id: user.id,
        anonymousName: identity.anonymous_name,
        avatarUrl: getAvatarUrl(
          identity.avatar_seed,
          identity.anonymous_name
        ),
      },
      messages: formattedMessages,
    });
  } catch (error) {
    console.error("Fetch chat messages error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Impossible de charger le salon de chat.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Tu dois être connecté pour participer au chat.",
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
          message: "Le message doit contenir entre 1 et 1000 caractères.",
        },
        { status: 400 }
      );
    }

    // Ensure table chat_messages exists
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const inserted = await sql`
      INSERT INTO chat_messages (user_id, content)
      VALUES (${user.id as string}, ${content})
      RETURNING id, user_id, content, created_at
    `;

    if (inserted.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Impossible d'envoyer le message.",
        },
        { status: 500 }
      );
    }

    const identity = await getOrCreateAnonymousIdentity(user.id as string);
    const newMsg = inserted[0];

    return NextResponse.json({
      success: true,
      message: {
        id: newMsg.id,
        userId: newMsg.user_id,
        content: newMsg.content,
        createdAt: newMsg.created_at,
        isMe: true,
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
    console.error("Post chat message error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue lors de l'envoi du message.",
      },
      { status: 500 }
    );
  }
}
