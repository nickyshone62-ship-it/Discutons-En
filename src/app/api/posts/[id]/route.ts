import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getOrCreateAnonymousIdentity,
  getAvatarUrl,
} from "@/lib/anonymous";
import { sql } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Identifiant du problème manquant.",
        },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    // Ensure post_views table exists for tracking 1 unique view per user
    await sql`
      CREATE TABLE IF NOT EXISTS post_views (
        user_id UUID NOT NULL,
        post_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id)
      )
    `;

    // Ensure likes tables exist
    await sql`
      CREATE TABLE IF NOT EXISTS post_likes (
        user_id UUID NOT NULL,
        post_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS comment_likes (
        user_id UUID NOT NULL,
        comment_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, comment_id)
      )
    `;
    await sql`
      ALTER TABLE comments ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0
    `;

    // Unique view tracking per user
    if (user) {
      const insertedView = await sql`
        INSERT INTO post_views (user_id, post_id)
        VALUES (${user.id as string}, ${id})
        ON CONFLICT (user_id, post_id) DO NOTHING
        RETURNING user_id
      `;

      if (insertedView.length > 0) {
        await sql`
          UPDATE posts
          SET views_count = COALESCE(views_count, 0) + 1
          WHERE id = ${id}
        `;
      }
    }

    // Get post details with author identity and category
    const posts = await sql`
      SELECT
        p.id,
        p.user_id,
        p.title,
        p.content,
        p.views_count,
        p.likes_count,
        p.comments_count,
        p.created_at,
        c.id AS category_id,
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
      WHERE p.id = ${id} AND p.status = 'PUBLISHED'
      LIMIT 1
    `;

    if (posts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Problème introuvable.",
        },
        { status: 404 }
      );
    }

    const post = posts[0];

    // Get comments for this post ordered by likes count descending
    const comments = await sql`
      SELECT
        c.id,
        c.content,
        COALESCE(c.likes_count, 0) AS likes_count,
        c.created_at,
        ai.anonymous_name,
        ai.avatar_seed
      FROM comments c
      INNER JOIN anonymous_identities ai
        ON ai.user_id = c.user_id
      WHERE c.post_id = ${id}
      ORDER BY COALESCE(c.likes_count, 0) DESC, c.created_at ASC
    `;

    // Check user liked status for post and comments
    let hasLikedPost = false;
    const userLikedCommentIds: string[] = [];

    let currentUserIdentity = null;
    if (user) {
      const identity = await getOrCreateAnonymousIdentity(user.id as string);
      currentUserIdentity = {
        anonymousName: identity.anonymous_name,
        avatarUrl: getAvatarUrl(
          identity.avatar_seed,
          identity.anonymous_name
        ),
      };

      const postLikeRow = await sql`
        SELECT post_id
        FROM post_likes
        WHERE user_id = ${user.id as string} AND post_id = ${id}
        LIMIT 1
      `;
      hasLikedPost = postLikeRow.length > 0;

      const commentLikeRows = await sql`
        SELECT comment_id
        FROM comment_likes
        WHERE user_id = ${user.id as string}
      `;
      for (const row of commentLikeRows) {
        userLikedCommentIds.push(row.comment_id as string);
      }
    }

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      likesCount: Number(comment.likes_count ?? 0),
      createdAt: comment.created_at,
      author: {
        anonymousName: comment.anonymous_name,
        avatarUrl: getAvatarUrl(
          comment.avatar_seed as string,
          comment.anonymous_name as string
        ),
      },
    }));

    return NextResponse.json({
      success: true,
      currentUserIdentity,
      hasLikedPost,
      userLikedCommentIds,
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        viewsCount: Number(post.views_count ?? 0),
        likesCount: Number(post.likes_count ?? 0),
        commentsCount: Number(post.comments_count ?? 0),
        createdAt: post.created_at,
        category: {
          id: post.category_id,
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
      },
      comments: formattedComments,
    });
  } catch (error) {
    console.error("Get post detail error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Impossible de charger la discussion.",
      },
      { status: 500 }
    );
  }
}
