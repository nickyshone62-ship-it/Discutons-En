"use client";

import { useEffect } from "react";

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
  }, []);

  return <>{children}</>;
}
