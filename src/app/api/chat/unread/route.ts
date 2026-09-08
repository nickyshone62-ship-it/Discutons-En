import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getAvatarUrl } from "@/lib/anonymous";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 });
    }

    // Get unread count for current user
    const unreadResult = await sql`
      SELECT COUNT(*)::int AS count
      FROM chat_messages cm
      LEFT JOIN chat_read_states crs ON crs.user_id = ${user.id as string}
      WHERE cm.user_id != ${user.id as string}
        AND (crs.last_read_at IS NULL OR cm.created_at > crs.last_read_at)
    `;

    const unreadCount = Number(unreadResult[0]?.count ?? 0);

    // Get recent messages for homepage
    const recentRows = await sql`
      SELECT
        cm.id,
        cm.user_id,
        cm.content,
        cm.audio_url,
        cm.created_at,
        ai.anonymous_name,
        ai.avatar_seed
      FROM chat_messages cm
      INNER JOIN anonymous_identities ai ON ai.user_id = cm.user_id
      ORDER BY cm.created_at DESC
      LIMIT 5
    `;

    const recentMessages = recentRows.map((msg) => ({
      id: msg.id,
      userId: msg.user_id,
      content: msg.content,
      audioUrl: msg.audio_url,
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
      unreadCount,
      recentMessages,
    });
  } catch (error) {
    console.error("Get unread error:", error);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
