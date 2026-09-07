"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, ArrowRight, Bell } from "lucide-react";
import {
  playNotificationChime,
  requestBrowserNotificationPermission,
  sendBrowserNotification,
} from "@/utils/audioNotification";

type ChatMessageNotification = {
  id: string;
  content: string;
  audioUrl?: string | null;
  createdAt: string;
  isMe: boolean;
  author: {
    anonymousName: string;
    avatarUrl: string;
  };
};

export default function GlobalChatNotification() {
  const pathname = usePathname();
  const router = useRouter();
  const [toast, setToast] = useState<ChatMessageNotification | null>(null);
  const lastSeenMsgIdRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    // Prompt for browser notification permission on user interaction
    const handleFirstInteraction = () => {
      requestBrowserNotificationPermission();
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    async function checkNewMessages() {
      try {
        const response = await fetch("/api/chat/messages", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();
        if (!data.success || !Array.isArray(data.messages)) return;

        const messages: ChatMessageNotification[] = data.messages;
        if (messages.length === 0) return;

        const latestMsg = messages[messages.length - 1];

        // On first load, record latest message ID without notifying
        if (isInitialLoadRef.current) {
          lastSeenMsgIdRef.current = latestMsg.id;
          isInitialLoadRef.current = false;
          return;
        }

        // Check if there is a new message from someone else
        if (
          latestMsg &&
          latestMsg.id !== lastSeenMsgIdRef.current &&
          !latestMsg.isMe
        ) {
          lastSeenMsgIdRef.current = latestMsg.id;

          // Sound & Browser notification
          playNotificationChime();
          sendBrowserNotification(
            `💬 Message de ${latestMsg.author.anonymousName}`,
            latestMsg.audioUrl
              ? "🎙️ Message vocal reçu"
              : latestMsg.content.slice(0, 80),
            latestMsg.author.avatarUrl
          );

          // If user is NOT on the chat page, show the floating toast!
          if (pathname !== "/chat") {
            setToast(latestMsg);

            // Auto-hide toast after 7 seconds
            setTimeout(() => {
              setToast(null);
            }, 7000);
          }
        } else if (latestMsg) {
          lastSeenMsgIdRef.current = latestMsg.id;
        }
      } catch {
        // Silent catch for background polling
      }
    }

    checkNewMessages();

    const interval = setInterval(checkNewMessages, 4000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (!toast || pathname === "/chat") return null;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-5 duration-300">
      <div className="relative rounded-3xl border border-cyan-400/50 bg-slate-950/95 p-4 text-white shadow-[0_0_30px_rgba(34,211,238,0.35)] backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shrink-0">
              <Bell size={18} className="animate-bounce" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
                Nouveau message en direct
              </p>
              <p className="text-xs font-bold text-white leading-tight mt-0.5">
                {toast.author.anonymousName}
              </p>
            </div>
          </div>

          <button
            onClick={() => setToast(null)}
            className="rounded-full p-1 text-cyan-200/70 hover:bg-white/10 hover:text-white transition"
            title="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3 bg-white/5 p-2.5 rounded-2xl border border-white/10">
          <img
            src={toast.author.avatarUrl}
            alt={toast.author.anonymousName}
            className="h-8 w-8 rounded-full border border-cyan-400/60 shrink-0 object-cover"
          />
          <p className="text-xs text-slate-200 font-medium line-clamp-2 italic flex-1">
            {toast.audioUrl ? "🎙️ Message vocal instantané" : `"${toast.content}"`}
          </p>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={() => {
              setToast(null);
              router.push("/chat");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 px-4 py-2 text-xs font-black text-slate-950 hover:from-cyan-300 hover:to-sky-300 transition transform active:scale-95 shadow-md shadow-cyan-400/30"
          >
            <span>Rejoindre le salon</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
