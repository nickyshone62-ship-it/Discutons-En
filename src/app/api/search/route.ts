import { NextResponse } from "next/server";
import { sql } from "@/lib/db/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();

    let postsResult;
    if (query) {
      const pattern = `%${query}%`;
      postsResult = await sql`
        SELECT 
          p.id, p.title, p.content, p.views_count, p.created_at,
          c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon,
          ai.anonymous_name, ai.avatar_url,
          (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id) AS comments_count,
          (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likes_count
        FROM posts p
        JOIN categories c ON p.category_id = c.id
        JOIN users u ON p.user_id = u.id
        LEFT JOIN anonymous_identities ai ON ai.user_id = u.id
        WHERE p.title ILIKE ${pattern} OR p.content ILIKE ${pattern} OR c.name ILIKE ${pattern}
        ORDER BY p.created_at DESC
        LIMIT 30
      `;
    } else {
      postsResult = await sql`
        SELECT 
          p.id, p.title, p.content, p.views_count, p.created_at,
          c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon,
          ai.anonymous_name, ai.avatar_url,
          (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id) AS comments_count,
          (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likes_count
        FROM posts p
        JOIN categories c ON p.category_id = c.id
        JOIN users u ON p.user_id = u.id
        LEFT JOIN anonymous_identities ai ON ai.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 30
      `;
    }

    const posts = postsResult.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      viewsCount: Number(row.views_count || 0),
      likesCount: Number(row.likes_count || 0),
      commentsCount: Number(row.comments_count || 0),
      createdAt: row.created_at,
      category: {
        name: row.category_name,
        slug: row.category_slug,
        icon: row.category_icon,
      },
      author: {
        anonymousName: row.anonymous_name || "Membre-Anonyme",
        avatarUrl: row.avatar_url || "https://api.dicebear.com/9.x/avataaars/svg?seed=Membre-Anonyme",
      },
    }));

    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la recherche." },
      { status: 500 }
    );
  }
}
