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

    const paymentMethod =
      typeof body.paymentMethod === "string" ? body.paymentMethod.trim() : "";
    const paymentPhone =
      typeof body.paymentPhone === "string" ? body.paymentPhone.trim() : "";
    const paymentRef =
      typeof body.paymentRef === "string" ? body.paymentRef.trim() : "";

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

    if (!["ORANGE_MONEY", "MOOV_MONEY", "WAVE"].includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: "Veuillez choisir un moyen de paiement valide (Orange Money, Moov Money ou Wave).",
          field: "paymentMethod",
        },
        { status: 400 }
      );
    }

    if (!paymentPhone || paymentPhone.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Veuillez entrer le numéro de téléphone valide utilisé pour le paiement.",
          field: "paymentPhone",
        },
        { status: 400 }
      );
    }

    if (!paymentRef || paymentRef.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Veuillez indiquer la référence de transaction ou l'ID de paiement.",
          field: "paymentRef",
        },
        { status: 400 }
      );
    }

    // Ensure all database tables & columns exist before querying
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        first_name TEXT,
        last_name TEXT,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'USER',
        is_active BOOLEAN DEFAULT TRUE,
        is_approved BOOLEAN DEFAULT FALSE,
        approval_status TEXT DEFAULT 'PENDING',
        payment_method TEXT,
        payment_phone TEXT,
        payment_ref TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'PENDING'`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_method TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_phone TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_ref TEXT`;

    // Migration: approve any existing legacy users without status
    await sql`UPDATE users SET is_approved = TRUE, approval_status = 'APPROVED' WHERE is_approved IS NULL`;

    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS anonymous_identities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        anonymous_name TEXT UNIQUE NOT NULL,
        avatar_seed TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`ALTER TABLE anonymous_identities ADD COLUMN IF NOT EXISTS avatar_seed TEXT`;

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

    // Check if this is the very first user in the database
    const userCountResult = await sql`SELECT COUNT(*) AS count FROM users`;
    const userCount = Number(userCountResult[0]?.count ?? 0);
    const isFirstUser = userCount === 0;

    const userRole = isFirstUser ? 'ADMIN' : 'USER';
    const isApproved = isFirstUser;
    const approvalStatus = isFirstUser ? 'APPROVED' : 'PENDING';

    const passwordHash = await hashPassword(password);

    const users = await sql`
      INSERT INTO users (
        email,
        username,
        first_name,
        last_name,
        password_hash,
        role,
        is_active,
        is_approved,
        approval_status,
        payment_method,
        payment_phone,
        payment_ref
      )
      VALUES (
        ${email},
        ${username},
        ${firstName},
        ${lastName},
        ${passwordHash},
        ${userRole},
        TRUE,
        ${isApproved},
        ${approvalStatus},
        ${paymentMethod},
        ${paymentPhone},
        ${paymentRef}
      )
      RETURNING id, email, username, first_name, last_name, role, is_active, is_approved, approval_status, payment_method, created_at
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

    if (isApproved) {
      await createSession(user.id as string);
    }

    return NextResponse.json({
      success: true,
      message: isApproved
        ? "Compte administrateur créé et connecté avec succès."
        : "Votre compte a été créé avec succès. Votre paiement est en attente d'approbation par un administrateur.",
      requiresApproval: !isApproved,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isApproved: user.is_approved,
        approvalStatus: user.approval_status,
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
