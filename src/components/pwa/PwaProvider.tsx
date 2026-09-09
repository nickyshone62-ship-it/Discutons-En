"use client";

import { useEffect } from "react";
import PushNotificationPrompt from "./PushNotificationPrompt";

export default function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker active with scope:", registration.scope);

            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    console.log("[PWA] New version available!");
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn("[PWA] Service Worker registration failed:", error);
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
      }
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
