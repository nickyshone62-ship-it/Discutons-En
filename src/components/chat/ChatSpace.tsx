"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  Edit2,
  Heart,
  Loader2,
  Mic,
  MoreVertical,
  Paperclip,
  Pause,
  Phone,
  Play,
  Reply,
  Search,
  Send,
  Smile,
  Trash2,
  Users,
  Video,
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

function VoicePlayer({ src, isMe }: { src: string; isMe?: boolean; avatarUrl?: string }) {
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
  const waveformHeights = [40, 75, 45, 90, 60, 35, 85, 50, 95, 40, 75, 55, 80, 45, 70];

  return (
    <div className="flex items-center gap-3 p-1 min-w-[220px] sm:min-w-[250px]">
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
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition transform active:scale-95 shadow-md ${
          isMe ? "bg-[#ff2a6d] text-white hover:bg-pink-600" : "bg-[#ff2a6d] text-white hover:bg-pink-600"
        }`}
      >
        {playing ? (
          <Pause size={18} className="fill-current" />
        ) : (
          <Play size={18} className="ml-0.5 fill-current" />
        )}
      </button>

      <div className="flex-1 space-y-1.5 cursor-pointer select-none" onClick={togglePlay}>
        <div className="flex items-center gap-0.5 h-4">
          {waveformHeights.map((h, index) => {
            const barProgress = (index / waveformHeights.length) * 100;
            const isPassed = progressPercent >= barProgress;

            return (
              <div
                key={index}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPassed ? "bg-[#ff2a6d]" : "bg-slate-300"
                }`}
                style={{
                  height: `${playing ? Math.max(30, h) : h}%`,
                }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1 text-[#ff2a6d] font-bold">
            <Mic size={12} /> Vocal
          </span>
          <span>
            {formatAudioTime(currentTime)} / {formatAudioTime(duration || 0)}
          </span>
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

  // Scrolling state & refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMsgIdRef = useRef<string | null>(null);
  const isUserScrolledUpRef = useRef(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [hasUnreadBanner, setHasUnreadBanner] = useState(false);

  function handleScroll() {
    const container = chatContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    // Strict threshold: if user is > 20px from bottom, consider them scrolled up!
    const isUp = scrollHeight - scrollTop - clientHeight > 20;
    isUserScrolledUpRef.current = isUp;
    setShowScrollBottomBtn(isUp);
    if (!isUp) {
      setHasUnreadBanner(false);
    }
  }

  function scrollToBottom(force = false) {
    if (!force && isUserScrolledUpRef.current) {
      // User is manually reading older messages higher up, NEVER force scroll down
      return;
    }

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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
        
        // Prevent state updates if messages array hasn't changed to avoid scroll jumps!
        setMessages((prevMsgs) => {
          if (
            prevMsgs.length === fetchedMsgs.length &&
            prevMsgs.every(
              (m, idx) =>
                m.id === fetchedMsgs[idx]?.id &&
                m.content === fetchedMsgs[idx]?.content &&
                m.likesCount === fetchedMsgs[idx]?.likesCount
            )
          ) {
            return prevMsgs;
          }
          return fetchedMsgs;
        });

        setCurrentUser(data.currentUser);

        if (fetchedMsgs.length > 0) {
          const latestMsg = fetchedMsgs[fetchedMsgs.length - 1];

          if (isFirstLoad) {
            lastMsgIdRef.current = latestMsg.id;
            setTimeout(() => scrollToBottom(true), 100);
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
              setTimeout(() => scrollToBottom(false), 100);
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

    fetch("/api/chat/read", { method: "POST" }).catch(() => {});

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/chat/stream");

      eventSource.onmessage = (event) => {
        if (!event.data || event.data.startsWith(":")) return;
        try {
          const incomingMsg = JSON.parse(event.data);
          if (!incomingMsg || !incomingMsg.id) return;

          let isNew = false;
          let isMe = false;

          setMessages((prev) => {
            if (prev.some((m) => m.id === incomingMsg.id)) {
              return prev;
            }

            isNew = true;
            const currentUserId = currentUser?.id;
            isMe = incomingMsg.userId === currentUserId || incomingMsg.isMe;
            const formattedMsg = { ...incomingMsg, isMe };

            return [...prev, formattedMsg];
          });

          if (isNew) {
            if (!isMe) {
              playNotificationChime();
              sendBrowserNotification(
                `💬 Message de ${incomingMsg.author?.anonymousName || 'Anonyme'}`,
                incomingMsg.audioUrl
                  ? "🎙️ Message vocal reçu"
                  : incomingMsg.content?.slice(0, 80) || "",
                incomingMsg.author?.avatarUrl || ""
              );
              setHasUnreadBanner(true);
              fetch("/api/chat/read", { method: "POST" }).catch(() => {});
            }

            if (isMe) {
              setTimeout(() => scrollToBottom(true), 50);
            } else {
              setTimeout(() => scrollToBottom(false), 50);
            }
          }
        } catch (e) {
          console.error("[ChatSpace] SSE parse error:", e);
        }
      };

      eventSource.onerror = () => {};
    } catch (e) {
      console.warn("[ChatSpace] EventSource SSE not supported:", e);
    }

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
        isUserScrolledUpRef.current = false;
        setShowScrollBottomBtn(false);
        setTimeout(() => scrollToBottom(true), 50);
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
        isUserScrolledUpRef.current = false;
        setShowScrollBottomBtn(false);
        setTimeout(() => scrollToBottom(true), 50);
      }
    } catch {
      alert("Erreur lors de l'envoi du vocal.");
    } finally {
      setSending(false);
    }
  }

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
      // transient error
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="h-16 animate-pulse rounded-2xl bg-[#075e54]/10 mb-4" />
        <div className="h-[500px] animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md my-12 rounded-3xl border border-pink-200 bg-white p-8 text-center shadow-xl text-slate-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-500 font-bold text-xl border border-red-200">
          !
        </div>
        <h1 className="mt-4 text-xl font-black font-display text-slate-900">
          Erreur de connexion
        </h1>
        <p className="mt-2 text-xs text-slate-600 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full bg-[#ff2a6d] px-6 py-3 text-xs font-black font-display uppercase tracking-widest text-white shadow-lg hover:bg-pink-600 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full flex-1 h-[calc(100dvh-6rem)] sm:h-[84vh] min-h-[500px] flex flex-col font-sans text-slate-900 overflow-hidden rounded-2xl border border-slate-300/80 bg-[#efeae2] shadow-2xl relative">
      {/* WHATSAPP TOP HEADER BAR */}
      <div className="flex items-center justify-between bg-[#f0f2f5] px-3 py-2.5 sm:px-4 sm:py-3 border-b border-slate-200 shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/accueil"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-200 transition"
            title="Retour à l'accueil"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-[#ff2a6d] text-white flex items-center justify-center font-extrabold text-sm shadow-sm overflow-hidden border border-pink-300">
              {currentUser ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.anonymousName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Users size={20} />
              )}
            </div>
            {/* Green Online Dot */}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          </div>

          <div className="leading-tight">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              Salon Communautaire
              <span className="text-[10px] bg-pink-100 text-[#ff2a6d] font-extrabold px-2 py-0.5 rounded-full border border-pink-200">
                Discutons-En
              </span>
            </h1>
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              en ligne · anonyme & instantané
            </p>
          </div>
        </div>

        {/* TOP RIGHT ACTION ICONS */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-slate-600">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-slate-200 transition text-slate-600 hidden sm:flex"
            title="Appel audio"
            onClick={() => alert("Fonctionnalité d'appel audio à venir")}
          >
            <Phone size={19} />
          </button>

          <button
            type="button"
            className="p-2 rounded-full hover:bg-slate-200 transition text-slate-600 hidden sm:flex"
            title="Appel vidéo"
            onClick={() => alert("Fonctionnalité d'appel vidéo à venir")}
          >
            <Video size={19} />
          </button>

          <button
            type="button"
            className="p-2 rounded-full hover:bg-slate-200 transition text-slate-600"
            title="Rechercher"
            onClick={() => alert("Recherche dans le salon")}
          >
            <Search size={19} />
          </button>

          <button
            type="button"
            className="p-2 rounded-full hover:bg-slate-200 transition text-slate-600"
            title="Options"
          >
            <MoreVertical size={19} />
          </button>
        </div>
      </div>

      {/* WHATSAPP MESSAGES CHAT WALLPAPER CANVAS */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 bg-whatsapp-pattern relative touch-pan-y"
      >
        {/* Sticky Date Badge */}
        <div className="flex justify-center my-2 sticky top-2 z-10">
          <span className="bg-white/90 text-slate-600 text-xs px-3.5 py-1 rounded-lg font-bold shadow-sm border border-slate-200/80 uppercase tracking-wider backdrop-blur-md">
            Aujourd'hui
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="flex h-[320px] flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ff2a6d] text-white shadow-lg">
              <Users size={28} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Bienvenue dans le Salon WhatsApp Discutons-En
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mt-1 leading-relaxed font-medium">
                Vos échanges sont chiffrés et anonymes. Démarrer une conversation ci-dessous.
              </p>
            </div>

            <div className="space-y-2 pt-2 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setInputText("Bonjour à tous ! 👋")}
                className="w-full rounded-full border border-slate-300 bg-white p-2.5 px-4 text-xs font-bold text-slate-800 hover:bg-pink-50 hover:text-[#ff2a6d] transition shadow-sm text-center"
              >
                👋 Saluer la communauté
              </button>
              <button
                type="button"
                onClick={() => setInputText("J'aimerais partager une idée...")}
                className="w-full rounded-full border border-slate-300 bg-white p-2.5 px-4 text-xs font-bold text-slate-800 hover:bg-pink-50 hover:text-[#ff2a6d] transition shadow-sm text-center"
              >
                💡 Partager une idée anonyme
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isEditing = editingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex w-full ${msg.isMe ? "justify-end" : "justify-start"} mb-2 group`}
              >
                <div
                  className={`whatsapp-bubble ${
                    msg.isMe ? "whatsapp-bubble-me" : "whatsapp-bubble-other"
                  } max-w-[85%] sm:max-w-[70%] p-2.5 px-3.5 relative shadow-sm transition`}
                >
                  {/* Sender name for incoming messages */}
                  {!msg.isMe && (
                    <div className="text-[12px] font-extrabold text-[#ff2a6d] mb-1 flex items-center gap-1.5">
                      <span>{msg.author.anonymousName}</span>
                    </div>
                  )}

                  {/* Quoted Reply Preview */}
                  {msg.replyTo && (
                    <div className="mb-2 rounded-lg border-l-4 border-[#ff2a6d] bg-black/5 p-2 text-xs text-slate-800 shadow-inner">
                      <div className="font-extrabold text-[#ff2a6d]">
                        {msg.replyTo.authorName}
                      </div>
                      <p className="text-xs text-slate-600 italic truncate mt-0.5">
                        "{msg.replyTo.content}"
                      </p>
                    </div>
                  )}

                  {/* Message Edit Input or Content */}
                  {isEditing ? (
                    <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#ff2a6d] my-1 shadow-md">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="bg-transparent text-slate-900 text-sm outline-none flex-1 px-1 font-medium"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(msg.id)}
                        className="p-1.5 rounded-lg bg-[#ff2a6d] text-white hover:bg-pink-600 transition"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      {/* Audio or Text */}
                      {msg.audioUrl ? (
                        <VoicePlayer src={msg.audioUrl} isMe={msg.isMe} avatarUrl={msg.author.avatarUrl} />
                      ) : (
                        <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed whitespace-pre-wrap break-words pr-12">
                          {msg.content}
                        </p>
                      )}

                      {/* WhatsApp Timestamp & Checkmarks */}
                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-semibold mt-1 space-x-1 select-none">
                        {msg.isEdited && <span className="italic text-slate-500">(modifié)</span>}
                        <span>{formatTime(msg.createdAt)}</span>
                        {msg.isMe && (
                          <CheckCheck size={14} className="text-[#ff2a6d] inline-block" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Likes Badge */}
                  {(msg.likesCount || 0) > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeMessage(msg.id);
                      }}
                      className={`absolute -bottom-2 right-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border shadow-sm transition transform active:scale-95 ${
                        msg.isLikedByMe
                          ? "bg-[#ff2a6d] text-white border-[#ff2a6d]"
                          : "bg-white text-[#ff2a6d] border-pink-200"
                      }`}
                    >
                      <Heart size={10} className="fill-current" />
                      <span>{msg.likesCount}</span>
                    </button>
                  )}

                  {/* Action Menu Trigger On Hover or Click */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setActiveMenuMsgId(activeMenuMsgId === msg.id ? null : msg.id)}
                      className="p-1 rounded-full bg-slate-200/80 text-slate-600 hover:bg-slate-300"
                      title="Options"
                    >
                      <MoreVertical size={13} />
                    </button>
                  </div>

                  {/* ACTION MENU MODAL PANEL */}
                  {activeMenuMsgId === msg.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-30"
                    >
                      <button
                        onClick={() => {
                          setReplyingToMsg(msg);
                          setActiveMenuMsgId(null);
                        }}
                        className="flex items-center gap-1 rounded-lg bg-pink-50 px-2.5 py-1 text-xs font-bold text-[#ff2a6d] hover:bg-pink-100 transition"
                      >
                        <Reply size={13} />
                        <span>Répondre</span>
                      </button>

                      <button
                        onClick={() => {
                          handleLikeMessage(msg.id);
                          setActiveMenuMsgId(null);
                        }}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          msg.isLikedByMe
                            ? "bg-pink-100 text-[#ff2a6d]"
                            : "bg-slate-100 text-slate-700 hover:text-[#ff2a6d]"
                        }`}
                      >
                        <Heart size={13} className={msg.isLikedByMe ? "fill-[#ff2a6d]" : ""} />
                        <span>Aimer</span>
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
                              className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                            >
                              <Edit2 size={13} />
                              <span>Modifier</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              handleDeleteMessage(msg.id);
                              setActiveMenuMsgId(null);
                            }}
                            className="flex items-center gap-1 rounded-lg bg-red-50 text-red-600 px-2.5 py-1 text-xs font-bold hover:bg-red-100 transition"
                          >
                            <Trash2 size={13} />
                            <span>Supprimer</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setActiveMenuMsgId(null)}
                        className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* FLOATING ABSOLUTE OVERLAY WHATSAPP SCROLL TO BOTTOM BUTTON */}
      {showScrollBottomBtn && (
        <button
          type="button"
          onClick={() => {
            isUserScrolledUpRef.current = false;
            setHasUnreadBanner(false);
            scrollToBottom(true);
          }}
          className="absolute bottom-20 right-4 sm:bottom-24 sm:right-6 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white text-[#ff2a6d] shadow-2xl border border-pink-200 flex items-center justify-center hover:bg-pink-50 transition transform active:scale-95 z-30 group"
          title="Faire défiler vers le bas"
        >
          <ChevronDown size={22} className="group-hover:translate-y-0.5 transition-transform" />
          {hasUnreadBanner && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff2a6d] border-2 border-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            </span>
          )}
        </button>
      )}

      {/* WHATSAPP FOOTER INPUT BAR */}
      <div className="bg-[#f0f2f5] p-2 sm:p-3 border-t border-slate-200 flex flex-col gap-2 shrink-0 z-20">
        {/* UNREAD BANNER */}
        {hasUnreadBanner && (
          <button
            type="button"
            onClick={() => {
              isUserScrolledUpRef.current = false;
              setHasUnreadBanner(false);
              scrollToBottom(true);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-pink-100 border border-pink-200 p-2 text-xs font-bold text-[#ff2a6d] hover:bg-[#ff2a6d] hover:text-white transition shadow-md animate-bounce cursor-pointer"
          >
            <Bell size={14} />
            <span>Nouveau message reçu · Cliquer pour voir ↓</span>
          </button>
        )}

        {/* REPLIES BAR PREVIEW */}
        {replyingToMsg && (
          <div className="flex items-center justify-between rounded-xl bg-white border-l-4 border-[#ff2a6d] p-2 px-3 text-xs text-slate-800 shadow-sm">
            <div className="flex items-center gap-2 truncate">
              <Reply size={14} className="text-[#ff2a6d] shrink-0" />
              <span>
                Réponse à <strong className="font-bold text-slate-900">{replyingToMsg.author.anonymousName}</strong>:{" "}
                <span className="italic truncate max-w-[200px] text-slate-600">
                  "{replyingToMsg.content}"
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setReplyingToMsg(null)}
              className="p-1 text-slate-500 hover:text-[#ff2a6d]"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* VOICE RECORDING BAR OR TEXT INPUT */}
        {recording ? (
          <div className="flex w-full items-center justify-between rounded-full bg-white px-4 py-2 border border-red-300 shadow-md">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-extrabold text-red-600 tracking-wider">
                Vocal ({recordTimer}s)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-1 rounded-full bg-[#ff2a6d] px-4 py-1.5 text-xs font-extrabold text-white hover:bg-pink-600 transition shadow-md"
              >
                Envoyer
                <Send size={13} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
            {/* EMOJI & ATTACHMENT */}
            <div className="flex items-center gap-1 text-slate-500">
              <button
                type="button"
                onClick={() => setInputText((prev) => prev + " 😊")}
                className="p-2 rounded-full hover:bg-slate-200 transition text-slate-600"
                title="Emojis"
              >
                <Smile size={22} />
              </button>

              <button
                type="button"
                onClick={() => setInputText("Bonjour à tous ! 👋")}
                className="p-2 rounded-full hover:bg-slate-200 transition text-slate-600 hidden sm:flex"
                title="Joindre un fichier"
              >
                <Paperclip size={21} />
              </button>
            </div>

            {/* PILL INPUT TEXT AREA */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitMessage();
                }
              }}
              placeholder={
                replyingToMsg
                  ? `Répondre à ${replyingToMsg.author.anonymousName}...`
                  : "Écrire un message"
              }
              maxLength={1000}
              className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none border border-slate-200 placeholder:text-slate-400 focus:border-[#ff2a6d] shadow-inner transition"
            />

            {/* MIC BUTTON OR SEND BUTTON */}
            {inputText.trim() ? (
              <button
                type="submit"
                disabled={sending}
                className="h-10 w-10 shrink-0 rounded-full bg-[#ff2a6d] text-white flex items-center justify-center shadow-md hover:bg-pink-600 transition transform active:scale-95 disabled:opacity-50"
                title="Envoyer"
              >
                {sending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} className="ml-0.5" />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="h-10 w-10 shrink-0 rounded-full bg-[#ff2a6d] text-white flex items-center justify-center shadow-md hover:bg-pink-600 transition transform active:scale-95"
                title="Enregistrer un message vocal"
              >
                <Mic size={19} />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
