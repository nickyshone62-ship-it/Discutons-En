import { NextResponse } from "next/server";
import { getCurrentUser, ensureDefaultAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    await ensureDefaultAdmin();
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        {
          success: false,
          message: "Accès refusé. Réservé aux administrateurs.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query;
    if (status === "PENDING") {
      query = await sql`
        SELECT
          id,
          email,
          username,
          first_name,
          last_name,
          role,
          is_active,
          is_approved,
          approval_status,
          payment_method,
          payment_phone,
          payment_ref,
          created_at
        FROM users
        WHERE is_approved = FALSE AND (approval_status = 'PENDING' OR approval_status IS NULL)
        ORDER BY created_at DESC
      `;
    } else if (status === "APPROVED") {
      query = await sql`
        SELECT
          id,
          email,
          username,
          first_name,
          last_name,
          role,
          is_active,
          is_approved,
          approval_status,
          payment_method,
          payment_phone,
          payment_ref,
          created_at
        FROM users
        WHERE is_approved = TRUE OR approval_status = 'APPROVED'
        ORDER BY created_at DESC
      `;
    } else if (status === "REJECTED") {
      query = await sql`
        SELECT
          id,
          email,
          username,
          first_name,
          last_name,
          role,
          is_active,
          is_approved,
          approval_status,
          payment_method,
          payment_phone,
          payment_ref,
          created_at
        FROM users
        WHERE approval_status = 'REJECTED'
        ORDER BY created_at DESC
      `;
    } else {
      query = await sql`
        SELECT
          id,
          email,
          username,
          first_name,
          last_name,
          role,
          is_active,
          is_approved,
          approval_status,
          payment_method,
          payment_phone,
          payment_ref,
          created_at
        FROM users
        ORDER BY created_at DESC
      `;
    }

    const usersList = query.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      isActive: Boolean(u.is_active),
      isApproved: Boolean(u.is_approved),
      approvalStatus: u.approval_status || (u.is_approved ? "APPROVED" : "PENDING"),
      paymentMethod: u.payment_method,
      paymentPhone: u.payment_phone,
      paymentRef: u.payment_ref,
      createdAt: u.created_at,
    }));

    return NextResponse.json({
      success: true,
      users: usersList,
    });
  } catch (error) {
    console.error("Admin list users error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Impossible de récupérer les utilisateurs.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        {
          success: false,
          message: "Accès refusé. Réservé aux administrateurs.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const targetUserId = typeof body.userId === "string" ? body.userId : "";
    const action = typeof body.action === "string" ? body.action : "";

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: "ID utilisateur requis." },
        { status: 400 }
      );
    }

    if (action === "APPROVE") {
      await sql`
        UPDATE users
        SET is_approved = TRUE, approval_status = 'APPROVED', updated_at = NOW()
        WHERE id = ${targetUserId}
      `;
      return NextResponse.json({
        success: true,
        message: "Le compte a été approuvé avec succès.",
      });
    }

    if (action === "REJECT") {
      await sql`
        UPDATE users
        SET is_approved = FALSE, approval_status = 'REJECTED', updated_at = NOW()
        WHERE id = ${targetUserId}
      `;
      return NextResponse.json({
        success: true,
        message: "La demande d'inscription a été rejetée.",
      });
    }

    if (action === "TOGGLE_ACTIVE") {
      await sql`
        UPDATE users
        SET is_active = NOT is_active, updated_at = NOW()
        WHERE id = ${targetUserId}
      `;
      return NextResponse.json({
        success: true,
        message: "Le statut d'activité de l'utilisateur a été mis à jour.",
      });
    }

    if (action === "SET_ROLE") {
      const newRole = body.role === "ADMIN" ? "ADMIN" : "USER";
      await sql`
        UPDATE users
        SET role = ${newRole}, updated_at = NOW()
        WHERE id = ${targetUserId}
      `;
      return NextResponse.json({
        success: true,
        message: `Rôle mis à jour vers ${newRole}.`,
      });
    }

    return NextResponse.json(
      { success: false, message: "Action invalide." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin patch user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Impossible de modifier l'utilisateur.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        {
          success: false,
          message: "Accès refusé. Réservé aux administrateurs.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: "ID utilisateur requis." },
        { status: 400 }
      );
    }

    // Delete user related data across tables
    await sql`DELETE FROM chat_messages WHERE user_id = ${targetUserId}`;
    await sql`DELETE FROM comments WHERE user_id = ${targetUserId}`;
    await sql`DELETE FROM posts WHERE user_id = ${targetUserId}`;
    await sql`DELETE FROM post_likes WHERE user_id = ${targetUserId}`;
    await sql`DELETE FROM comment_likes WHERE user_id = ${targetUserId}`;
    await sql`DELETE FROM post_views WHERE user_id = ${targetUserId}`;
    await sql`DELETE FROM anonymous_identities WHERE user_id = ${targetUserId}`;
    await sql`DELETE FROM sessions WHERE user_id = ${targetUserId}`;
    await sql`DELETE FROM users WHERE id = ${targetUserId}`;

    return NextResponse.json({
      success: true,
      message: "Utilisateur supprimé définitivement.",
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Impossible de supprimer l'utilisateur.",
      },
      { status: 500 }
    );
  }
}
