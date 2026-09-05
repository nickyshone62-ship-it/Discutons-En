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

    // Ensure table chat_messages exists with audio_url and is_edited columns
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        content TEXT NOT NULL,
        audio_url TEXT NULL,
        is_edited BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS audio_url TEXT NULL
    `;
    await sql`
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE
    `;

    const identity = await getOrCreateAnonymousIdentity(user.id as string);

    // Fetch recent messages
    const messages = await sql`
      SELECT
        cm.id,
        cm.user_id,
        cm.content,
        cm.audio_url,
        COALESCE(cm.is_edited, FALSE) AS is_edited,
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
      audioUrl: msg.audio_url || null,
      isEdited: !!msg.is_edited,
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
    const audioUrl = typeof body.audioUrl === "string" ? body.audioUrl : null;

    if (!audioUrl && (!content || content.length < 1 || content.length > 1000)) {
      return NextResponse.json(
        {
          success: false,
          message: "Le message texte doit contenir entre 1 et 1000 caractères.",
        },
        { status: 400 }
      );
    }

    // Ensure columns exist
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        content TEXT NOT NULL,
        audio_url TEXT NULL,
        is_edited BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS audio_url TEXT NULL
    `;
    await sql`
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE
    `;

    const inserted = await sql`
      INSERT INTO chat_messages (user_id, content, audio_url)
      VALUES (${user.id as string}, ${content || "🎤 Message vocal"}, ${audioUrl})
      RETURNING id, user_id, content, audio_url, is_edited, created_at
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
        audioUrl: newMsg.audio_url,
        isEdited: !!newMsg.is_edited,
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
