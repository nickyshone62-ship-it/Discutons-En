"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    // Initial state check
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !justReconnected) return null;

  return (
    <div
      aria-live="polite"
      className={`fixed top-0 left-0 right-0 z-[100] px-4 py-2 text-xs font-bold font-display text-center transition-all duration-300 backdrop-blur-md flex items-center justify-center gap-2 shadow-lg ${
        isOffline
          ? "bg-rose-950/90 text-rose-200 border-b border-rose-500/30 animate-pulse"
          : "bg-emerald-950/90 text-emerald-200 border-b border-emerald-500/30"
      }`}
    >
      {isOffline ? (
        <>
          <WifiOff className="h-4 w-4 text-rose-400" />
          <span>Connexion Internet interrompue · Mode hors ligne actif</span>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4 text-emerald-400" />
          <span>Connexion Internet rétablie</span>
        </>
      )}
    </div>
  );
}
