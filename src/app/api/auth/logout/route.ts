import { NextResponse } from "next/server";
import { logout } from "@/lib/auth/session";

export async function POST() {
  try {
    await logout();

    return NextResponse.json({
      success: true,
      message: "Déconnexion réussie",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue",
      },
      {
        status: 500,
      }
    );
  }
}
