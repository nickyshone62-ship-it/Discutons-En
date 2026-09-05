"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

type ChatMessage = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  isMe: boolean;
  author: {
    anonymousName: string;
    avatarUrl: string;
  };
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatSpace() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    anonymousName: string;
    avatarUrl: string;
  } | null>(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function fetchMessages(isFirstLoad = false) {
    try {
      const response = await fetch("/api/chat/messages", {
        cache: "no-store",
      });

      if (response.status === 401) {
        window.location.href = "/connexion";
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setMessages(data.messages || []);
        setCurrentUser(data.currentUser);
        if (isFirstLoad) {
          setTimeout(scrollToBottom, 100);
        }
      } else if (isFirstLoad) {
        setError(data.message || "Impossible de charger le chat.");
      }
    } catch {
      if (isFirstLoad) {
        setError("Erreur réseau. Impossible de se connecter au salon.");
      }
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages(true);

    // Poll every 3 seconds for new live messages
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const textToSend = inputText.trim();
    if (!textToSend) return;

    setSending(true);
    setInputText("");

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: textToSend,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/connexion";
        return;
      }

      if (response.ok && data.success) {
        setMessages((prev) => [...prev, data.message]);
        setTimeout(scrollToBottom, 50);
      } else {
        alert(data.message || "Erreur d'envoi du message.");
      }
    } catch {
      alert("Erreur de connexion. Message non envoyé.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-16 animate-pulse rounded-2xl bg-white mb-4" />
        <div className="h-[500px] animate-pulse rounded-3xl bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md my-12 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 font-bold text-xl">
          !
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-950">
          Erreur de connexion
        </h1>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 flex flex-col h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)]">
      {/* CHAT HEADER */}
      <div className="mb-4 flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/accueil"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition"
            title="Retour à l'accueil"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <MessageSquare size={20} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-950">
                Salon Communautaire en Direct
              </h1>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400">
              Échanges instantanés en direct entre membres anonymes
            </p>
          </div>
        </div>

        {currentUser && (
          <div className="hidden sm:flex items-center gap-2.5 rounded-2xl bg-slate-50 px-3.5 py-1.5 border border-slate-100">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.anonymousName}
              className="h-7 w-7 rounded-full"
            />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser.anonymousName}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                Anonyme
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ANONYMITY BANNER */}
      <div className="mb-3 rounded-2xl bg-sky-50 px-4 py-2.5 border border-sky-100 flex items-center justify-between text-xs text-sky-800 shrink-0">
        <span className="flex items-center gap-1.5 font-semibold">
          <ShieldCheck size={16} className="text-sky-600" />
          Votre identité réelle reste masquée. Tous les messages sont anonymisés.
        </span>
        <span className="hidden md:flex items-center gap-1 text-slate-500 font-medium">
          <Sparkles size={14} className="text-amber-500" />
          Respect & Bienveillance requis
        </span>
      </div>

      {/* MESSAGES FEED */}
      <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 mb-3">
              <Users size={26} />
            </div>
            <h3 className="font-bold text-slate-950 text-base">
              Soyez le premier à envoyer un message !
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Ce salon permet à toute la communauté de discuter librement et en direct.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.isMe ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <img
                src={msg.author.avatarUrl}
                alt={msg.author.anonymousName}
                className="h-8 w-8 rounded-full shrink-0 mt-1"
              />

              <div
                className={`max-w-[78%] sm:max-w-[65%] space-y-1 ${
                  msg.isMe ? "items-end text-right" : "items-start text-left"
                }`}
              >
                <div
                  className={`flex items-center gap-2 text-[11px] font-semibold text-slate-400 ${
                    msg.isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <span>{msg.author.anonymousName}</span>
                  <span>·</span>
                  <span>{formatTime(msg.createdAt)}</span>
                </div>

                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words inline-block shadow-sm ${
                    msg.isMe
                      ? "bg-slate-950 text-white rounded-tr-none font-medium"
                      : "bg-slate-100 text-slate-800 rounded-tl-none font-medium"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* CHAT INPUT */}
      <form
        onSubmit={handleSendMessage}
        className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-md shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Écris ton message anonyme..."
          maxLength={1000}
          className="flex-1 bg-transparent px-3 text-sm font-medium outline-none text-slate-900 placeholder:text-slate-400"
        />

        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-sky-500 px-4 text-xs font-bold text-white transition hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Envoyer
              <Send size={14} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
