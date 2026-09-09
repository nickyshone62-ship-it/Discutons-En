"use client";

import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronDown,
  CornerDownRight,
  Edit2,
  Heart,
  Loader2,
  MessageSquare,
  Mic,
  Paperclip,
  Pause,
  Play,
  Reply,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  playNotificationChime,
  requestBrowserNotificationPermission,
  sendBrowserNotification,
} from "@/utils/audioNotification";

type ChatMessage = {
  id: string;
  userId: string;
  content: string;
  audioUrl?: string | null;
  isEdited?: boolean;
  likesCount?: number;
  isLikedByMe?: boolean;
  replyTo?: {
    id: string;
    authorName: string;
    content: string;
  } | null;
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

function VoicePlayer({ src, isMe }: { src: string; isMe?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      if (audio.readyState === 0) {
        audio.load();
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setPlaying(true))
          .catch((err) => {
            console.error("Audio play error on mobile:", err);
            setPlaying(false);
          });
      } else {
        setPlaying(true);
      }
    }
  }

  function formatAudioTime(seconds: number) {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const waveformHeights = [40, 75, 45, 90, 60, 35, 85, 50, 95, 40, 75, 55, 80];

  return (
    <div
      className={`relative flex items-center gap-3 rounded-2xl p-2.5 px-3.5 shadow-md border min-w-[200px] sm:min-w-[230px] backdrop-blur-xl ${
        isMe
          ? "bg-slate-950/80 text-white border-cyan-400/40"
          : "bg-slate-900/80 text-slate-100 border-white/20"
      }`}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        playsInline
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.duration) {
            setDuration(audioRef.current.duration);
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onEnded={() => {
          setPlaying(false);
          setCurrentTime(0);
        }}
      />

      <button
        type="button"
        onClick={togglePlay}
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition transform active:scale-95 shadow-md ${
          isMe
            ? "bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 hover:from-cyan-300 hover:to-sky-300"
            : "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
        }`}
      >
        {playing && (
          <span className="absolute inset-0 rounded-full bg-cyan-400 opacity-60 animate-ping" />
        )}
        {playing ? (
          <Pause size={15} className="relative z-10 fill-current" />
        ) : (
          <Play size={15} className="relative z-10 ml-0.5 fill-current" />
        )}
      </button>

      <div className="flex-1 space-y-1.5 cursor-pointer" onClick={togglePlay}>
        <div className="flex items-center justify-between text-[11px] font-black font-display tracking-wide">
          <span className="text-cyan-300 flex items-center gap-1">
            🎙️ Vocal
          </span>
          <span className="text-cyan-100/70 font-sans text-[10px]">
            {formatAudioTime(currentTime)} / {formatAudioTime(duration || 0)}
          </span>
        </div>

        <div className="flex items-center gap-0.5 h-3.5">
          {waveformHeights.map((h, index) => {
            const barProgress = (index / waveformHeights.length) * 100;
            const isPassed = progressPercent >= barProgress;

            return (
              <div
                key={index}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPassed
                    ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                    : "bg-white/20"
                }`}
                style={{
                  height: `${playing ? Math.max(30, h) : h}%`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
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

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Tap-to-open action menu state
  const [activeMenuMsgId, setActiveMenuMsgId] = useState<string | null>(null);

  // Replying state
  const [replyingToMsg, setReplyingToMsg] = useState<ChatMessage | null>(null);


  // Voice recording state
  const [recording, setRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMsgIdRef = useRef<string | null>(null);
  const [hasUnreadBanner, setHasUnreadBanner] = useState(false);

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
        const fetchedMsgs: ChatMessage[] = data.messages || [];
        setMessages(fetchedMsgs);
        setCurrentUser(data.currentUser);

        if (fetchedMsgs.length > 0) {
          const latestMsg = fetchedMsgs[fetchedMsgs.length - 1];

          if (isFirstLoad) {
            lastMsgIdRef.current = latestMsg.id;
            setTimeout(scrollToBottom, 100);
          } else if (
            latestMsg &&
            lastMsgIdRef.current &&
            latestMsg.id !== lastMsgIdRef.current
          ) {
            lastMsgIdRef.current = latestMsg.id;

            if (!latestMsg.isMe) {
              playNotificationChime();
              sendBrowserNotification(
                `💬 Message de ${latestMsg.author.anonymousName}`,
                latestMsg.audioUrl
                  ? "🎙️ Message vocal reçu"
                  : latestMsg.content.slice(0, 80),
                latestMsg.author.avatarUrl
              );
              setHasUnreadBanner(true);
              setTimeout(scrollToBottom, 100);
            }
          }
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
    requestBrowserNotificationPermission();
    fetchMessages(true);

    // Mark as read immediately on opening chat
    fetch("/api/chat/read", { method: "POST" }).catch(() => {});

    // 1. Instant Real-Time SSE Stream (< 50ms)
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/chat/stream");

      eventSource.onmessage = (event) => {
        if (!event.data || event.data.startsWith(":")) return;
        try {
          const incomingMsg = JSON.parse(event.data);
          if (!incomingMsg || !incomingMsg.id) return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === incomingMsg.id)) {
              return prev;
            }

            const currentUserId = currentUser?.id;
            const isMe = incomingMsg.userId === currentUserId || incomingMsg.isMe;
            const formattedMsg = { ...incomingMsg, isMe };

            if (!isMe) {
              playNotificationChime();
              sendBrowserNotification(
                `💬 Message de ${formattedMsg.author.anonymousName}`,
                formattedMsg.audioUrl
                  ? "🎙️ Message vocal reçu"
                  : formattedMsg.content.slice(0, 80),
                formattedMsg.author.avatarUrl
              );
              setHasUnreadBanner(true);

              // Mark read in background
              fetch("/api/chat/read", { method: "POST" }).catch(() => {});
            }

            // Smart scroll: scroll to bottom on new message
            if (isMe || !hasUnreadBanner) {
              setTimeout(scrollToBottom, 50);
            }

            return [...prev, formattedMsg];
          });
        } catch (e) {
          console.error("[ChatSpace] SSE parse error:", e);
        }
      };

      eventSource.onerror = () => {
        // SSE reconnect handles itself, fallback polling runs in background
      };
    } catch (e) {
      console.warn("[ChatSpace] EventSource SSE not supported:", e);
    }

    // 2. Safety backup polling (every 10s)
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 10000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [currentUser]);

  async function submitMessage() {
    const textToSend = inputText.trim();
    if (!textToSend || sending) return;

    setSending(true);
    setInputText("");
    const replyToId = replyingToMsg ? replyingToMsg.id : null;
    setReplyingToMsg(null);

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: textToSend,
          replyToId,
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

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitMessage();
  }

  function getSupportedMimeType() {
    if (typeof MediaRecorder === "undefined") return "";
    const candidateTypes = [
      "audio/mp4",
      "audio/aac",
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg",
    ];
    for (const type of candidateTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  }

  // Voice recording handlers
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const actualType = mediaRecorder.mimeType || mimeType || "audio/mp4";
        const audioBlob = new Blob(audioChunksRef.current, { type: actualType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await sendVoiceMessage(base64Audio);
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      setRecording(true);
      setRecordTimer(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordTimer((prev) => prev + 1);
      }, 1000);
    } catch (e) {
      console.error("Microphone error:", e);
      alert("Accès au microphone refusé ou non supporté par votre téléphone.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }

  function cancelRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }

  async function sendVoiceMessage(base64Audio: string) {
    setSending(true);
    const replyToId = replyingToMsg ? replyingToMsg.id : null;
    setReplyingToMsg(null);

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "🎤 Message vocal",
          audioUrl: base64Audio,
          replyToId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessages((prev) => [...prev, data.message]);
        setTimeout(scrollToBottom, 50);
      }
    } catch {
      alert("Erreur lors de l'envoi du vocal.");
    } finally {
      setSending(false);
    }
  }

  // Edit message handler
  async function handleSaveEdit(messageId: string) {
    if (!editText.trim()) return;

    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editText,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: editText, isEdited: true }
              : msg
          )
        );
        setEditingId(null);
      } else {
        alert(data.message || "Impossible de modifier.");
      }
    } catch {
      alert("Erreur de connexion lors de la modification.");
    }
  }

  // Delete message handler
  async function handleDeleteMessage(messageId: string) {
    if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return;

    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      } else {
        alert(data.message || "Impossible de supprimer.");
      }
    } catch {
      alert("Erreur de connexion lors de la suppression.");
    }
  }

  // Like message handler
  async function handleLikeMessage(messageId: string) {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}/like`, {
        method: "POST",
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, likesCount: data.likesCount, isLikedByMe: data.liked }
              : m
          )
        );
      }
    } catch {
      // transient error ignore
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-16 animate-pulse rounded-3xl bg-white/10 mb-4" />
        <div className="h-[500px] animate-pulse rounded-3xl bg-white/10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md my-12 rounded-3xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-2xl shadow-2xl text-white">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-red-300 font-bold text-xl border border-red-500/30">
          !
        </div>
        <h1 className="mt-4 text-xl font-black font-display text-white">
          Erreur de connexion
        </h1>
        <p className="mt-2 text-xs text-cyan-100/80 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full bg-cyan-400 px-6 py-3 text-xs font-black font-display uppercase tracking-widest text-slate-950 shadow-lg shadow-cyan-400/40 hover:bg-cyan-300 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full flex-1 h-full flex flex-col p-3 sm:p-5 md:p-6 font-sans text-slate-900 overflow-hidden gap-3">
      {/* HEADER */}
      <div className="flex items-center justify-between rounded-3xl border border-pink-100/80 bg-white/90 p-3.5 sm:p-4 shadow-md backdrop-blur-2xl shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/accueil"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 hover:bg-pink-50 hover:text-[#ff2a6d] transition border border-slate-200 shadow-sm"
            title="Retour à l'accueil"
          >
            <ArrowLeft size={20} />
          </Link>

          <Logo variant="horizontal" size="sm" href="/accueil" />
          <div>
            <h1 className="text-base sm:text-lg font-extrabold font-display tracking-tight text-slate-900 flex items-center gap-2">
              Salon Communautaire
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#ff2a6d] animate-pulse shadow-[0_0_10px_rgba(255,42,109,0.8)]" />
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Échanges instantanés en direct
            </p>
          </div>
        </div>

        {/* TOP-RIGHT USER BADGE */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2.5 p-1.5 px-3 rounded-full bg-pink-50 border border-pink-200 backdrop-blur-md shadow-sm">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.anonymousName}
                className="h-7 w-7 rounded-full border border-[#ff2a6d] shadow-sm object-cover"
                title={currentUser.anonymousName}
              />
              <span className="text-xs font-extrabold font-display text-slate-900 hidden sm:inline">
                {currentUser.anonymousName}
              </span>
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-[#ff2a6d] border border-pink-200">
              <Users size={18} />
            </div>
          )}
        </div>
      </div>

      {/* MESSAGES FEED */}
      <div className="flex-1 overflow-y-auto rounded-3xl border border-pink-100/80 bg-white/90 p-4 sm:p-6 shadow-lg backdrop-blur-2xl space-y-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-pink-100 text-[#ff2a6d] border border-pink-200 shadow-inner">
              <Users size={28} />
            </div>
            <div>
              <h3 className="font-extrabold font-display text-slate-900 text-lg">
                Salon Communautaire en Direct
              </h3>
              <p className="text-xs font-medium text-slate-500 max-w-sm mt-1 leading-relaxed">
                Soyez le premier à envoyer un message anonyme ou choisissez un sujet ci-dessous.
              </p>
            </div>

            {/* STACKED PROMPT BUTTONS */}
            <div className="space-y-2 pt-1 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setInputText("Bonjour à tous ! 👋")}
                className="w-full rounded-2xl border border-slate-200 bg-[#f4f3f6] p-3 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-[#ff2a6d] hover:text-white transition shadow-sm text-left flex items-center justify-between group"
              >
                <span>👋 Saluer la communauté</span>
                <span className="opacity-0 group-hover:opacity-100 transition">→</span>
              </button>

              <button
                type="button"
                onClick={() => setInputText("J'aimerais avoir des conseils sur...")}
                className="w-full rounded-2xl border border-slate-200 bg-[#f4f3f6] p-3 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-[#ff2a6d] hover:text-white transition shadow-sm text-left flex items-center justify-between group"
              >
                <span>💡 Demander un conseil anonyme</span>
                <span className="opacity-0 group-hover:opacity-100 transition">→</span>
              </button>

              <button
                type="button"
                onClick={() => setInputText("Qui est disponible pour discuter ?")}
                className="w-full rounded-2xl border border-slate-200 bg-[#f4f3f6] p-3 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-[#ff2a6d] hover:text-white transition shadow-sm text-left flex items-center justify-between group"
              >
                <span>💬 Lancer une discussion</span>
                <span className="opacity-0 group-hover:opacity-100 transition">→</span>
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
          const isEditing = editingId === msg.id;

          return (
            <div
              key={msg.id}
              className={`group flex gap-3 ${
                msg.isMe ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <img
                src={msg.author.avatarUrl}
                alt={msg.author.anonymousName}
                className="h-9 w-9 rounded-full shrink-0 mt-1 border border-pink-300 shadow-sm object-cover"
              />

              <div
                className={`max-w-[85%] sm:max-w-[70%] space-y-1 ${
                  msg.isMe ? "items-end text-right" : "items-start text-left"
                }`}
              >
                <div
                  className={`flex items-center gap-2 text-[11px] font-bold text-slate-500 ${
                    msg.isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <span className="font-display text-slate-800">{msg.author.anonymousName}</span>
                  <span>·</span>
                  <span className="text-[10px] font-sans font-normal opacity-80">{formatTime(msg.createdAt)}</span>
                  {msg.isEdited && (
                    <span className="italic text-[#ff2a6d] text-[10px]">(modifié)</span>
                  )}
                </div>

                {/* QUOTED REPLY PREVIEW */}
                {msg.replyTo && (
                  <div className="mb-2 rounded-2xl border-l-4 border-[#ff2a6d] bg-pink-50 p-2.5 px-3.5 text-xs text-slate-800 shadow-sm border border-pink-100">
                    <div className="flex items-center gap-2 font-extrabold font-display text-[#ff2a6d]">
                      <CornerDownRight size={14} className="text-[#ff2a6d] shrink-0" />
                      <span>En réponse à <span className="text-slate-900 underline font-black">{msg.replyTo.authorName}</span></span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 italic truncate font-medium pl-4 border-l border-pink-300">
                      "{msg.replyTo.content}"
                    </p>
                  </div>
                )}

                {isEditing ? (
                  <div className="flex items-center gap-2 bg-white border border-[#ff2a6d] p-2.5 rounded-2xl text-left shadow-lg">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="bg-transparent text-slate-900 text-base outline-none flex-1 px-2 font-medium"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(msg.id)}
                      className="p-2 rounded-xl bg-[#ff2a6d] text-white hover:bg-pink-600 transition font-bold shadow-md"
                      title="Enregistrer"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 transition"
                      title="Annuler"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative inline-block text-left">
                    {/* MESSAGE BUBBLE */}
                    <div
                      onClick={() => setActiveMenuMsgId(activeMenuMsgId === msg.id ? null : msg.id)}
                      className="cursor-pointer transition transform active:scale-[0.98]"
                      title="Cliquer pour afficher les options"
                    >
                      {msg.audioUrl ? (
                        <VoicePlayer src={msg.audioUrl} isMe={msg.isMe} />
                      ) : (
                        <div
                          className={`rounded-3xl px-4.5 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words inline-block shadow-md ${
                            msg.isMe
                              ? "btn-pink text-white font-semibold rounded-tr-none shadow-[0_4px_14px_rgba(255,42,109,0.3)]"
                              : "bg-[#f4f3f6] text-slate-900 font-medium rounded-tl-none border border-slate-200/80 hover:bg-white"
                          }`}
                        >
                          {msg.content}
                        </div>
                      )}
                    </div>

                    {/* LIKES BADGE */}
                    {(msg.likesCount || 0) > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikeMessage(msg.id);
                        }}
                        className={`absolute -bottom-2 right-2 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border shadow-md transition transform active:scale-95 ${
                          msg.isLikedByMe
                            ? "bg-[#ff2a6d] text-white border-[#ff2a6d]"
                            : "bg-white text-[#ff2a6d] border-pink-200"
                        }`}
                      >
                        <Heart size={11} className="fill-current" />
                        <span>{msg.likesCount}</span>
                      </button>
                    )}

                    {/* ACTION MENU PANEL */}
                    {activeMenuMsgId === msg.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className={`mt-2 flex flex-wrap items-center gap-2 rounded-2xl border border-pink-200 bg-white p-2 px-3 shadow-2xl z-30 max-w-full ${
                          msg.isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <button
                          onClick={() => {
                            setReplyingToMsg(msg);
                            setActiveMenuMsgId(null);
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-pink-50 px-3 py-1.5 text-xs font-bold text-[#ff2a6d] hover:bg-pink-100 transition active:scale-95"
                        >
                          <Reply size={14} />
                          <span>Répondre</span>
                        </button>

                        <button
                          onClick={() => {
                            handleLikeMessage(msg.id);
                            setActiveMenuMsgId(null);
                          }}
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                            msg.isLikedByMe
                              ? "bg-pink-100 text-[#ff2a6d] border border-pink-200"
                              : "bg-slate-100 text-slate-700 hover:text-[#ff2a6d]"
                          }`}
                        >
                          <Heart size={14} className={msg.isLikedByMe ? "fill-[#ff2a6d]" : ""} />
                          <span>Aimer ({msg.likesCount || 0})</span>
                        </button>

                        {msg.isMe && (
                          <>
                            {!msg.audioUrl && (
                              <button
                                onClick={() => {
                                  setEditingId(msg.id);
                                  setEditText(msg.content);
                                  setActiveMenuMsgId(null);
                                }}
                                className="flex items-center gap-1.5 rounded-xl bg-pink-50 px-3 py-1.5 text-xs font-bold text-[#ff2a6d] hover:bg-pink-100 transition active:scale-95"
                              >
                                <Edit2 size={14} />
                                <span>Modifier</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleDeleteMessage(msg.id);
                                setActiveMenuMsgId(null);
                              }}
                              className="flex items-center gap-1.5 rounded-xl bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-black text-red-600 hover:bg-red-100 transition active:scale-95 shadow-sm"
                            >
                              <Trash2 size={14} className="text-red-500" />
                              <span>Supprimer</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => setActiveMenuMsgId(null)}
                          className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                          title="Fermer"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}

        {/* STATUS INDICATOR */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 py-2">
          <span className="h-4 w-4 rounded-full border-2 border-[#ff2a6d] border-t-transparent animate-spin" />
          <span>Connecté en direct · salon anonyme</span>
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* CHAT INPUT CONTAINER CARD */}
      <div className="w-full shrink-0 space-y-2">
        {/* UNREAD NEW MESSAGE BANNER */}
        {hasUnreadBanner && (
          <button
            type="button"
            onClick={() => {
              setHasUnreadBanner(false);
              scrollToBottom();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-pink-50 border border-pink-200 p-2.5 px-4 text-xs font-bold text-[#ff2a6d] hover:bg-[#ff2a6d] hover:text-white transition shadow-md animate-bounce cursor-pointer"
          >
            <Bell size={15} />
            <span>Nouveau message anonyme reçu · Cliquer pour voir ↓</span>
          </button>
        )}

        {/* REPLIES PREVIEW BAR */}
        {replyingToMsg && (
          <div className="flex items-center justify-between rounded-2xl bg-pink-50 border border-pink-200 p-2.5 px-4 text-xs text-slate-800 shadow-sm">
            <div className="flex items-center gap-2 truncate">
              <Reply size={15} className="text-[#ff2a6d] shrink-0" />
              <span>
                En réponse à <strong className="font-bold text-slate-900">{replyingToMsg.author.anonymousName}</strong>:{" "}
                <span className="italic truncate max-w-[220px] text-slate-600">
                  "{replyingToMsg.content}"
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setReplyingToMsg(null)}
              className="p-1 text-slate-500 hover:text-[#ff2a6d]"
              title="Annuler la réponse"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {recording ? (
          <div className="flex w-full items-center justify-between rounded-3xl border border-red-200 bg-red-50 p-4 px-5 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-extrabold font-display tracking-wider text-red-700">
                ENREGISTREMENT VOCAL ({recordTimer}s)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="rounded-full px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-2.5 text-xs font-extrabold font-display uppercase tracking-widest text-white hover:bg-red-700 transition shadow-md"
              >
                Envoyer
                <Send size={14} />
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSendMessage}
            className="flex w-full flex-col rounded-3xl border border-pink-100/80 bg-white/95 p-3.5 sm:p-4 shadow-lg backdrop-blur-2xl space-y-3"
          >
            {/* TOP AREA: INPUT FIELD */}
            <div className="w-full px-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitMessage();
                  }
                }}
                placeholder={
                  replyingToMsg
                    ? `Répondre à ${replyingToMsg.author.anonymousName}...`
                    : "Écrivez votre message..."
                }
                rows={2}
                maxLength={1000}
                className="w-full resize-none bg-transparent px-2 text-sm sm:text-base font-medium outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* BOTTOM BAR INSIDE CARD */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInputText((prev) => prev + " 😊");
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f3f6] text-slate-600 hover:bg-pink-50 hover:text-[#ff2a6d] transition border border-slate-200/60"
                  title="Ajouter un emoji"
                >
                  <Smile size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInputText("Bonjour à tous ! 👋");
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f3f6] text-slate-600 hover:bg-pink-50 hover:text-[#ff2a6d] transition border border-slate-200/60"
                  title="Pièce jointe / Prompt"
                >
                  <Paperclip size={18} />
                </button>

                <button
                  type="button"
                  onClick={startRecording}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f3f6] text-slate-600 hover:bg-pink-50 hover:text-[#ff2a6d] transition border border-slate-200/60"
                  title="Message vocal"
                >
                  <Mic size={18} />
                </button>
              </div>

              {/* SOLID SEND BUTTON ON RIGHT */}
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="flex items-center gap-2 rounded-2xl btn-pink text-white px-6 py-2.5 text-xs sm:text-sm font-extrabold font-display uppercase tracking-wider transition transform active:scale-95 disabled:opacity-40 shadow-md"
                title="Envoyer le message"
              >
                <span>Envoyer</span>
                {sending ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </form>
        )}

        {/* POWERED BY FOOTER AT BOTTOM */}
        <div className="flex justify-center items-center gap-1.5 py-0.5 text-[11px] text-slate-400 font-medium">
          <span>Propulsé par</span>
          <span className="font-black font-display text-[#ff2a6d] tracking-wider">Discutons-En</span>
        </div>
      </div>
    </div>
  );
}

