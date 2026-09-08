import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json(
        { success: false, message: "Subscription invalide" },
        { status: 400 }
      );
    }

    // Upsert subscription for user
    await sql`
      INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
      VALUES (${user.id as string}, ${endpoint}, ${keys.p256dh}, ${keys.auth})
      ON CONFLICT (endpoint)
      DO UPDATE SET
        user_id = ${user.id as string},
        p256dh = ${keys.p256dh},
        auth = ${keys.auth},
        created_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true, message: "Subscription enregistrée" });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Non connecté" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body;

    if (endpoint) {
      await sql`
        DELETE FROM push_subscriptions
        WHERE endpoint = ${endpoint} AND user_id = ${user.id as string}
      `;
    }

    return NextResponse.json({ success: true, message: "Subscription supprimée" });
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
