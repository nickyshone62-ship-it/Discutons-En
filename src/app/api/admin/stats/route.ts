import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
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

    const pendingResult = await sql`
      SELECT COUNT(*) AS count
      FROM users
      WHERE is_approved = FALSE AND (approval_status = 'PENDING' OR approval_status IS NULL)
    `;

    const approvedResult = await sql`
      SELECT COUNT(*) AS count
      FROM users
      WHERE is_approved = TRUE OR approval_status = 'APPROVED'
    `;

    const rejectedResult = await sql`
      SELECT COUNT(*) AS count
      FROM users
      WHERE approval_status = 'REJECTED'
    `;

    const totalUsersResult = await sql`
      SELECT COUNT(*) AS count
      FROM users
    `;

    const totalPostsResult = await sql`
      SELECT COUNT(*) AS count
      FROM posts
    `;

    const totalCommentsResult = await sql`
      SELECT COUNT(*) AS count
      FROM comments
    `;

    return NextResponse.json({
      success: true,
      stats: {
        pendingCount: Number(pendingResult[0]?.count ?? 0),
        approvedCount: Number(approvedResult[0]?.count ?? 0),
        rejectedCount: Number(rejectedResult[0]?.count ?? 0),
        totalUsers: Number(totalUsersResult[0]?.count ?? 0),
        totalPosts: Number(totalPostsResult[0]?.count ?? 0),
        totalComments: Number(totalCommentsResult[0]?.count ?? 0),
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Impossible de récupérer les statistiques admin.",
      },
      { status: 500 }
    );
  }
}
