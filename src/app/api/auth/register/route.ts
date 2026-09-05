import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  hashPassword,
  createSession,
  normalizeEmail,
  normalizeUsername,
  validateEmail,
  validateUsername,
  validatePassword,
} from "@/lib/auth";
import { getOrCreateAnonymousIdentity } from "@/lib/anonymous";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const rawEmail = typeof body.email === "string" ? body.email : "";
    const rawUsername =
      typeof body.username === "string" ? body.username : "";
    const firstName =
      typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName =
      typeof body.lastName === "string" ? body.lastName.trim() : "";
    const password =
      typeof body.password === "string" ? body.password : "";
    const avatarSeed =
      typeof body.avatarSeed === "string" ? body.avatarSeed.trim() : "";

    const email = normalizeEmail(rawEmail);
    const username = normalizeUsername(rawUsername);

    if (!firstName || firstName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Le prénom doit contenir au moins 2 caractères.",
        },
        { status: 400 }
      );
    }

    if (!lastName || lastName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Le nom doit contenir au moins 2 caractères.",
        },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Adresse email invalide.",
        },
        { status: 400 }
      );
    }

    if (!validateUsername(username)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le nom d'utilisateur doit contenir entre 3 et 50 caractères : lettres, chiffres ou underscore.",
        },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        {
          success: false,
          message: "Le mot de passe doit contenir entre 8 et 128 caractères.",
        },
        { status: 400 }
      );
    }

    // Ensure columns exist
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT`;

    const existingEmail = await sql`
      SELECT id
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (existingEmail.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cette adresse email est déjà utilisée.",
          field: "email",
        },
        { status: 409 }
      );
    }

    const existingUsername = await sql`
      SELECT id
      FROM users
      WHERE username = ${username}
      LIMIT 1
    `;

    if (existingUsername.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Ce nom d'utilisateur est déjà utilisé.",
          field: "username",
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const users = await sql`
      INSERT INTO users (
        email,
        username,
        first_name,
        last_name,
        password_hash,
        role,
        is_active
      )
      VALUES (
        ${email},
        ${username},
        ${firstName},
        ${lastName},
        ${passwordHash},
        'USER',
        TRUE
      )
      RETURNING id, email, username, first_name, last_name, role, is_active, created_at
    `;

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Impossible de créer le compte.",
        },
        { status: 500 }
      );
    }

    const user = users[0];

    await getOrCreateAnonymousIdentity(user.id as string, avatarSeed);

    await createSession(user.id as string);

    return NextResponse.json({
      success: true,
      message: "Compte créé avec succès.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    const message =
      error instanceof Error ? error.message.toLowerCase() : "";

    if (
      message.includes("users_email_key") ||
      message.includes("email")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Cette adresse email est déjà utilisée.",
          field: "email",
        },
        { status: 409 }
      );
    }

    if (
      message.includes("users_username_key") ||
      message.includes("username")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Ce nom d'utilisateur est déjà utilisé.",
          field: "username",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue lors de la création du compte.",
      },
      { status: 500 }
    );
  }
}
