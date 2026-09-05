import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  createSession,
  normalizeEmail,
  validateEmail,
  validatePassword,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const rawEmail = typeof body.email === "string" ? body.email : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    const email = normalizeEmail(rawEmail);

    if (!validateEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Adresse email invalide.",
        },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        {
          success: false,
          message: "Mot de passe invalide.",
        },
        { status: 400 }
      );
    }

    const users = await sql`
      SELECT
        id,
        email,
        username,
        password_hash,
        role,
        is_active
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email ou mot de passe incorrect.",
        },
        { status: 401 }
      );
    }

    const user = users[0];

    if (!user.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Ce compte est désactivé.",
        },
        { status: 403 }
      );
    }

    const passwordValid = await verifyPassword(
      password,
      user.password_hash as string
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Email ou mot de passe incorrect.",
        },
        { status: 401 }
      );
    }

    await createSession(user.id as string);

    return NextResponse.json({
      success: true,
      message: "Connexion réussie.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue lors de la connexion.",
      },
      { status: 500 }
    );
  }
}
