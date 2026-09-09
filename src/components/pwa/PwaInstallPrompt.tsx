"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/brand/Logo";
import { Download, X, Share, PlusSquare, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // 2. Check dismissal state from localStorage
    const dismissedUntil = localStorage.getItem("pwa_install_dismissed");
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = userAgent.includes("safari") && !userAgent.includes("crios") && !userAgent.includes("fxios");

    if (isIosDevice && isSafari && !isStandalone) {
      setIsIos(true);
      setShowPrompt(true);
    }

    // 4. Capture beforeinstallprompt for Android/Chrome/Windows/macOS
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log("[PWA] Application installée avec succès !");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setInstalled(true);
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    // Dismiss for 3 days
    const threeDays = Date.now() + 3 * 24 * 60 * 60 * 1000;
    localStorage.setItem("pwa_install_dismissed", threeDays.toString());
  };

  if (installed || !showPrompt) return null;

  return (
    <>
      {/* Primary Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
        <div className="relative overflow-hidden rounded-3xl border border-pink-200 bg-white/95 p-4 sm:p-5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(255,42,109,0.2)] text-slate-900">
          <div className="pointer-events-none absolute -top-10 -left-10 h-24 w-24 rounded-full bg-pink-300/30 blur-xl" />

          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1 transition"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <Logo variant="icon" size="sm" />

            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-extrabold font-display text-slate-900 flex items-center gap-1.5">
                Installer Discutons-En
                <Sparkles className="h-4 w-4 text-[#ff2a6d]" />
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Accès rapide depuis votre écran d'accueil, notifications instantanées et mode hors ligne.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl btn-pink px-4 py-2.5 text-xs font-black font-display uppercase tracking-wider text-white shadow-lg active:scale-95"
            >
              <Download className="h-4 w-4" />
              TÉLÉCHARGER L'APPLICATION
            </button>

            <button
              onClick={handleDismiss}
              className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-sm w-full rounded-3xl border border-pink-200 bg-white p-6 backdrop-blur-2xl shadow-2xl text-slate-900 space-y-5">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 border border-pink-200 text-[#ff2a6d]">
                <Share className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-extrabold font-display text-slate-900">
                Télécharger sur iPhone / iPad
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Suivez ces 2 étapes simples sur Safari :
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-3 rounded-2xl border border-pink-100 bg-pink-50/50 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff2a6d] text-white font-black">
                  1
                </span>
                <span>
                  Appuyez sur le bouton <strong>Partager</strong> <Share className="inline h-3.5 w-3.5 text-[#ff2a6d]" /> dans la barre Safari.
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-pink-100 bg-pink-50/50 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff2a6d] text-white font-black">
                  2
                </span>
                <span>
                  Défilez vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong> <PlusSquare className="inline h-3.5 w-3.5 text-[#ff2a6d]" />.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full rounded-2xl btn-pink py-3 text-xs font-black font-display uppercase tracking-widest text-white shadow-lg"
            >
              COMPRIS !
            </button>
          </div>
        </div>
      )}
    </>
  );
}
