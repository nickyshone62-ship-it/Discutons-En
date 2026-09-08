"use client";

import { useEffect, useState } from "react";
import { Bell, X, Check, Shield } from "lucide-react";
import { requestNotificationPermission, subscribeUserToPush } from "@/utils/pushNotifications";

export default function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    // Hide if already granted or denied
    if (Notification.permission !== "default") {
      return;
    }

    // Check dismissal preference
    const dismissedUntil = localStorage.getItem("push_prompt_dismissed");
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // Delay prompt appearance by 3 seconds for smooth UX
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnablePush = async () => {
    setLoading(true);
    try {
      const permission = await requestNotificationPermission();

      if (permission === "granted") {
        const subscription = await subscribeUserToPush();

        if (subscription) {
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription.toJSON()),
          });
        }

        setSuccess(true);
        setTimeout(() => setShowPrompt(false), 2500);
      } else {
        handleDismiss();
      }
    } catch (e) {
      console.error("[Push Prompt] Error enabling notifications:", e);
      handleDismiss();
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Dismiss for 7 days
    const sevenDays = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("push_prompt_dismissed", sevenDays.toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
      <div className="relative overflow-hidden rounded-2xl border border-cyan-400/40 bg-slate-950/95 p-4.5 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.7)] text-white">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-cyan-400/20 blur-xl" />

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 transition"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          <div className="flex items-center gap-3 py-1 text-emerald-400 font-bold text-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/40">
              <Check className="h-5 w-5" />
            </div>
            <span>Notifications activées avec succès !</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3 pr-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                <Bell className="h-5 w-5 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-black font-display text-white">
                  Active les notifications 💬
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sois averti instantanément sur ton iPhone / Android dès qu'un nouveau message t'attend.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleEnablePush}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 px-4 py-2.5 text-xs font-black font-display text-slate-950 transition hover:from-cyan-300 hover:to-sky-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-95 disabled:opacity-50"
              >
                {loading ? "Activation en cours..." : "ACTIVERN LES NOTIFICATIONS"}
              </button>

              <button
                onClick={handleDismiss}
                className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
              >
                Plus tard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
