"use client";

import { useEffect } from "react";
import PushNotificationPrompt from "./PushNotificationPrompt";

export default function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered with scope:", registration.scope);

            // Listen for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    console.log("[PWA] New version available! Reloading recommended.");
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error("[PWA] Service Worker registration failed:", error);
          });
      });
    } else if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV !== "production"
    ) {
      // Register SW even in dev mode if explicitly needed for testing
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("[PWA Dev] SW active with scope:", reg.scope))
        .catch((err) => console.warn("[PWA Dev] SW registration:", err));
    }

    // Sync Badging API periodically if supported
    const fetchUnreadAndBadge = async () => {
      try {
        const res = await fetch("/api/chat/unread");
        const data = await res.json();
        if (res.ok && data.success && typeof data.unreadCount === "number") {
          if ("setAppBadge" in navigator) {
            if (data.unreadCount > 0) {
              (navigator as any).setAppBadge(data.unreadCount).catch(() => {});
            } else if ("clearAppBadge" in navigator) {
              (navigator as any).clearAppBadge().catch(() => {});
            }
          }
        }
      } catch {}
    };

    fetchUnreadAndBadge();
    const interval = setInterval(fetchUnreadAndBadge, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {children}
      <PushNotificationPrompt />
    </>
  );
}

