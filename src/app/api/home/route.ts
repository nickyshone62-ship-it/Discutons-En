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

    const identity = await getOrCreateAnonymousIdentity(user.id as string);

    const categories = await sql`
      SELECT
        id,
        name,
        slug,
        description,
        icon
      FROM categories
      WHERE is_active = TRUE
      ORDER BY name ASC
    `;

    const posts = await sql`
      SELECT
        p.id,
        p.title,
        p.content,
        p.views_count,
        p.likes_count,
        p.comments_count,
        p.created_at,
        c.name AS category_name,
        c.slug AS category_slug,
        c.icon AS category_icon,
        ai.anonymous_name,
        ai.avatar_seed
      FROM posts p
      INNER JOIN categories c
        ON c.id = p.category_id
      INNER JOIN anonymous_identities ai
        ON ai.user_id = p.user_id
      WHERE p.status = 'PUBLISHED'
      ORDER BY p.created_at DESC
      LIMIT 10
    `;

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      viewsCount: Number(post.views_count ?? 0),
      likesCount: Number(post.likes_count ?? 0),
      commentsCount: Number(post.comments_count ?? 0),
      createdAt: post.created_at,
      category: {
        name: post.category_name,
        slug: post.category_slug,
        icon: post.category_icon,
      },
      author: {
        anonymousName: post.anonymous_name,
        avatarUrl: getAvatarUrl(
          post.avatar_seed as string,
          post.anonymous_name as string
        ),
      },
    }));

    // Fetch unread count for current user
    const unreadResult = await sql`
      SELECT COUNT(*)::int AS count
      FROM chat_messages cm
      LEFT JOIN chat_read_states crs ON crs.user_id = ${user.id as string}
      WHERE cm.user_id != ${user.id as string}
        AND (crs.last_read_at IS NULL OR cm.created_at > crs.last_read_at)
    `;
    const unreadCount = Number(unreadResult[0]?.count ?? 0);

    // Fetch recent chat messages for homepage summary
    const recentChatRows = await sql`
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
      LIMIT 4
    `;

    const recentMessages = recentChatRows.map((msg) => ({
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
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      identity: {
        anonymousName: identity.anonymous_name,
        avatarUrl: getAvatarUrl(
          identity.avatar_seed,
          identity.anonymous_name
        ),
      },
      categories,
      posts: formattedPosts,
      unreadCount,
      recentMessages,
    });
  } catch (error) {
    console.error("Home API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Impossible de charger la page d'accueil.",
      },
      { status: 500 }
    );
  }
}
