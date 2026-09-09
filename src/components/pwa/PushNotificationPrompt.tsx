"use client";

import { useEffect, useState } from "react";
import { Bell, X, Check } from "lucide-react";
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

    // Delay prompt appearance by 2.5 seconds for smooth UX
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 2500);

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
          }).catch(() => {});
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
    // Dismiss for 3 days
    const threeDays = Date.now() + 3 * 24 * 60 * 60 * 1000;
    localStorage.setItem("push_prompt_dismissed", threeDays.toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
      <div className="relative overflow-hidden rounded-3xl border border-pink-200 bg-white/95 p-4.5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(255,42,109,0.25)] text-slate-900">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-pink-300/30 blur-xl" />

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1 transition"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          <div className="flex items-center gap-3 py-1 text-emerald-600 font-extrabold text-xs sm:text-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600">
              <Check className="h-5 w-5" />
            </div>
            <span>Notifications mobiles activées avec succès !</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3 pr-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pink-50 border border-pink-200 text-[#ff2a6d] shadow-sm">
                <Bell className="h-5 w-5 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-extrabold font-display text-slate-900">
                  Activer les notifications 💬
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Soyez averti instantanément sur votre téléphone dès qu'un nouveau message arrive.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleEnablePush}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl btn-pink px-4 py-2.5 text-xs font-black font-display uppercase tracking-wider text-white shadow-md active:scale-95 disabled:opacity-50"
              >
                {loading ? "Activation..." : "ACTIVER LES NOTIFICATIONS"}
              </button>

              <button
                onClick={handleDismiss}
                className="rounded-2xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
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
