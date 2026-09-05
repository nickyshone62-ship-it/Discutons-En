import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Impossible de charger les catégories.",
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
          message: "Tu dois être connecté pour publier un problème.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const categoryId = typeof body.categoryId === "string" ? body.categoryId.trim() : "";

    if (!title || title.length < 5 || title.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message: "Le titre doit contenir entre 5 et 150 caractères.",
          field: "title",
        },
        { status: 400 }
      );
    }

    if (!content || content.length < 20 || content.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          message: "Le contenu doit contenir au moins 20 caractères (maximum 5000).",
          field: "content",
        },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Veuillez sélectionner une catégorie.",
          field: "categoryId",
        },
        { status: 400 }
      );
    }

    // Verify category existence
    const existingCategory = await sql`
      SELECT id
      FROM categories
      WHERE id = ${categoryId} AND is_active = TRUE
      LIMIT 1
    `;

    if (existingCategory.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "La catégorie sélectionnée n'existe pas.",
          field: "categoryId",
        },
        { status: 400 }
      );
    }

    // Insert post
    const posts = await sql`
      INSERT INTO posts (
        user_id,
        category_id,
        title,
        content,
        status,
        views_count,
        likes_count,
        comments_count
      )
      VALUES (
        ${user.id as string},
        ${categoryId},
        ${title},
        ${content},
        'PUBLISHED',
        0,
        0,
        0
      )
      RETURNING id, title, created_at
    `;

    if (posts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Impossible de publier le problème.",
        },
        { status: 500 }
      );
    }

    const newPost = posts[0];

    return NextResponse.json({
      success: true,
      message: "Ton problème a été publié avec succès !",
      postId: newPost.id,
    });
  } catch (error) {
    console.error("Create post error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue lors de la publication.",
      },
      { status: 500 }
    );
  }
}
