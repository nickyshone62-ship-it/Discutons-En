import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  createSession,
  normalizeEmail,
  validateEmail,
  validatePassword,
  verifyPassword,
  ensureDefaultAdmin,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await ensureDefaultAdmin();
    const body = await request.json();

    const rawIdentifier = typeof body.email === "string" ? body.email : typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";

    const identifier = rawIdentifier.trim().toLowerCase();

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          message: "Veuillez indiquer votre email ou nom d'utilisateur.",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Veuillez indiquer votre mot de passe.",
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
        is_active,
        is_approved,
        approval_status,
        payment_method
      FROM users
      WHERE LOWER(email) = ${identifier} OR LOWER(username) = ${identifier}
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

    // Check approval status unless the user is an admin or is explicitly approved
    const isApproved = user.is_approved === true || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isApproved) {
      if (user.approval_status === 'REJECTED') {
        return NextResponse.json(
          {
            success: false,
            message: "Votre demande d'inscription a été rejetée par l'administrateur. Veuillez contacter le support.",
          },
          { status: 403 }
        );
      }

      const methodLabel = user.payment_method === 'ORANGE_MONEY'
        ? 'Orange Money'
        : user.payment_method === 'MOOV_MONEY'
        ? 'Moov Money'
        : user.payment_method === 'WAVE'
        ? 'Wave'
        : 'Paiement mobile';

      return NextResponse.json(
        {
          success: false,
          message: `Votre compte est en attente d'approbation par un administrateur après vérification de votre paiement (${methodLabel}). Veuillez patienter.`,
        },
        { status: 403 }
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
