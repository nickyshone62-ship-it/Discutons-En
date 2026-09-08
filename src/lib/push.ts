import webPush from "web-push";
import { sql } from "@/lib/db";

// Initialize VAPID Keys
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:contact@discutons-en.app";

if (publicKey && privateKey) {
  try {
    webPush.setVapidDetails(subject, publicKey, privateKey);
    console.log("[Web Push] VAPID details successfully configured.");
  } catch (err) {
    console.warn("[Web Push] Error setting VAPID details:", err);
  }
} else {
  console.warn("[Web Push] VAPID keys missing in environment variables.");
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

/**
 * Send Web Push Notification to all active subscriptions of target users (excluding sender)
 */
export async function sendPushNotificationToUsers(
  excludeUserId: string,
  payload: PushPayload
): Promise<void> {
  if (!publicKey || !privateKey) return;

  try {
    // Fetch all push subscriptions for other users
    const subscriptions = await sql`
      SELECT id, user_id, endpoint, p256dh, auth
      FROM push_subscriptions
      WHERE user_id != ${excludeUserId}
    `;

    if (subscriptions.length === 0) return;

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || "/chat",
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: payload.badge || "/icons/icon-192x192.png",
      tag: payload.tag || "chat-message",
    });

    const sendPromises = subscriptions.map(async (sub) => {
      const pushSub = {
        endpoint: sub.endpoint as string,
        keys: {
          p256dh: sub.p256dh as string,
          auth: sub.auth as string,
        },
      };

      try {
        await webPush.sendNotification(pushSub, notificationPayload);
      } catch (err: any) {
        // If subscription is expired or unregistered (statusCode 404 or 410), purge from DB
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log(`[Web Push] Purging stale subscription ${sub.id}`);
          await sql`
            DELETE FROM push_subscriptions WHERE id = ${sub.id as string}
          `;
        } else {
          console.warn(`[Web Push] Notification failed for ${sub.endpoint}:`, err.message);
        }
      }
    });

    await Promise.allSettled(sendPromises);
  } catch (error) {
    console.error("[Web Push] Send error:", error);
  }
}
