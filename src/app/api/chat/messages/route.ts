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

    // Ensure columns exist
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        content TEXT NOT NULL,
        audio_url TEXT NULL,
        reply_to_id UUID NULL,
        is_edited BOOLEAN DEFAULT FALSE,
        likes_count INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reply_to_id UUID NULL
    `;
    await sql`
      ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS chat_message_likes (
        user_id UUID NOT NULL,
        message_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, message_id)
      )
    `;

    const identity = await getOrCreateAnonymousIdentity(user.id as string);

    // Fetch messages joining parent message info if replying
    const messages = await sql`
      SELECT
        cm.id,
        cm.user_id,
        cm.content,
        cm.audio_url,
        cm.reply_to_id,
        COALESCE(cm.is_edited, FALSE) AS is_edited,
        COALESCE(cm.likes_count, 0) AS likes_count,
        cm.created_at,
        ai.anonymous_name,
        ai.avatar_seed,
        parent.content AS parent_content,
        parent_ai.anonymous_name AS parent_author_name
      FROM chat_messages cm
      INNER JOIN anonymous_identities ai
        ON ai.user_id = cm.user_id
      LEFT JOIN chat_messages parent
        ON parent.id = cm.reply_to_id
      LEFT JOIN anonymous_identities parent_ai
        ON parent_ai.user_id = parent.user_id
      ORDER BY cm.created_at ASC
      LIMIT 50
    `;

    // Fetch user liked message ids
    const likedRows = await sql`
      SELECT message_id
      FROM chat_message_likes
      WHERE user_id = ${user.id as string}
    `;
    const likedMessageIds = new Set(likedRows.map((r) => r.message_id as string));

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      userId: msg.user_id,
      content: msg.content,
      audioUrl: msg.audio_url || null,
      isEdited: !!msg.is_edited,
      likesCount: Number(msg.likes_count ?? 0),
      isLikedByMe: likedMessageIds.has(msg.id as string),
      replyTo: msg.reply_to_id
        ? {
            id: msg.reply_to_id,
            authorName: msg.parent_author_name || "Membre",
            content: msg.parent_content || "Message",
          }
        : null,
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
    const replyToId = typeof body.replyToId === "string" ? body.replyToId : null;

    if (!audioUrl && (!content || content.length < 1 || content.length > 1000)) {
      return NextResponse.json(
        {
          success: false,
          message: "Le message texte doit contenir entre 1 et 1000 caractères.",
        },
        { status: 400 }
      );
    }

    const inserted = await sql`
      INSERT INTO chat_messages (user_id, content, audio_url, reply_to_id)
      VALUES (${user.id as string}, ${content || "🎤 Message vocal"}, ${audioUrl}, ${replyToId})
      RETURNING id, user_id, content, audio_url, reply_to_id, is_edited, likes_count, created_at
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

    // Fetch parent details if replying
    let replyTo = null;
    if (replyToId) {
      const parentRows = await sql`
        SELECT
          cm.id,
          cm.content,
          ai.anonymous_name
        FROM chat_messages cm
        INNER JOIN anonymous_identities ai ON ai.user_id = cm.user_id
        WHERE cm.id = ${replyToId}
        LIMIT 1
      `;
      if (parentRows.length > 0) {
        replyTo = {
          id: parentRows[0].id,
          authorName: parentRows[0].anonymous_name,
          content: parentRows[0].content,
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: {
        id: newMsg.id,
        userId: newMsg.user_id,
        content: newMsg.content,
        audioUrl: newMsg.audio_url,
        isEdited: !!newMsg.is_edited,
        likesCount: 0,
        isLikedByMe: false,
        replyTo,
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
