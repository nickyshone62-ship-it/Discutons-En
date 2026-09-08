"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, Home, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = "/";
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 text-white flex items-center justify-center p-4">
      {/* Background Glow Orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-400 opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-purple-500 opacity-20 blur-3xl" />

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 max-w-md w-full rounded-3xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl shadow-2xl text-center space-y-6">
        
        {/* Icon Header */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
          <WifiOff className="h-10 w-10 animate-pulse" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black font-display tracking-wide text-white">
            Connexion indisponible
          </h1>
          <p className="text-sm text-slate-300">
            Vous êtes actuellement hors ligne. Certaines fonctionnalités de Discutons-En nécessitent un accès Internet.
          </p>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isOnline ? "bg-emerald-400 animate-ping" : "bg-rose-500"
            }`}
          />
          <span className={isOnline ? "text-emerald-300" : "text-slate-400"}>
            {isOnline ? "Connexion rétablie !" : "Hors ligne"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 px-6 py-3 text-sm font-black font-display text-slate-950 transition hover:from-cyan-300 hover:to-sky-300 shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            RÉESSAYER LA CONNEXION
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            <Home className="h-4 w-4" />
            Page d'accueil
          </Link>
        </div>

        <p className="text-xs text-slate-500 pt-2">
          Discutons-En Progressive Web App
        </p>
      </div>
    </div>
  );
}
