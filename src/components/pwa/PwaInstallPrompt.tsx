"use client";

import { useEffect, useState } from "react";
import { Download, X, Share, PlusSquare, Sparkles, CheckCircle2 } from "lucide-react";

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
        <div className="relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-slate-950/90 p-4 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-white">
          <div className="pointer-events-none absolute -top-10 -left-10 h-24 w-24 rounded-full bg-cyan-400/20 blur-xl" />

          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 transition"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-500 text-slate-950 font-black font-display shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              <Sparkles className="h-6 w-6 fill-slate-950" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black font-display tracking-wide text-white flex items-center gap-1.5">
                Installer Discutons-En
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Accès rapide depuis votre écran d'accueil, notifications instantanées et mode hors ligne.
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 px-4 py-2.5 text-xs font-black font-display text-slate-950 transition hover:from-cyan-300 hover:to-sky-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-95"
            >
              <Download className="h-4 w-4" />
              INSTALLER L'APPLICATION
            </button>

            <button
              onClick={handleDismiss}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-sm w-full rounded-3xl border border-cyan-400/30 bg-slate-900/95 p-6 backdrop-blur-2xl shadow-2xl text-white space-y-5">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
                <Share className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black font-display text-white">
                Installer sur iPhone / iPad
              </h3>
              <p className="text-xs text-slate-300">
                Suivez ces 2 étapes simples sur Safari :
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-slate-950 font-black">
                  1
                </span>
                <span>
                  Appuyez sur le bouton <strong>Partager</strong> <Share className="inline h-3.5 w-3.5 text-cyan-400" /> dans la barre Safari.
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-slate-950 font-black">
                  2
                </span>
                <span>
                  Défilez vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong> <PlusSquare className="inline h-3.5 w-3.5 text-cyan-400" />.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 py-2.5 text-xs font-black font-display text-slate-950"
            >
              COMPRIS !
            </button>
          </div>
        </div>
      )}
    </>
  );
}
