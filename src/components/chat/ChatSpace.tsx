"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  CornerDownRight,
  Edit2,
  Heart,
  Loader2,
  MessageSquare,
  Mic,
  Pause,
  Play,
  Reply,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoaded = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
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
      className={`relative flex items-center gap-2.5 rounded-2xl p-2 px-3 shadow-sm transition-all border min-w-[180px] sm:min-w-[210px] ${
        isMe
          ? "bg-slate-950 text-white border-slate-800"
          : "bg-slate-100 text-slate-800 border-slate-200"
      }`}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        type="button"
        onClick={togglePlay}
        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition transform active:scale-95 ${
          isMe
            ? "bg-sky-500 text-white hover:bg-sky-400"
            : "bg-sky-600 text-white hover:bg-sky-500"
        }`}
      >
        {playing && (
          <span className="absolute inset-0 rounded-xl bg-sky-400 opacity-40 animate-ping" />
        )}
        {playing ? (
          <Pause size={14} className="relative z-10" />
        ) : (
          <Play size={14} className="relative z-10 ml-0.5" />
        )}
      </button>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between text-[10px] font-bold tracking-tight">
          <span className={isMe ? "text-sky-400" : "text-sky-600"}>
            🎙️ Vocal
          </span>
          <span className={isMe ? "text-slate-400" : "text-slate-500"}>
            {formatAudioTime(currentTime)} / {formatAudioTime(duration || 0)}
          </span>
        </div>

        <div className="flex items-center gap-0.5 h-3">
          {waveformHeights.map((h, index) => {
            const barProgress = (index / waveformHeights.length) * 100;
            const isPassed = progressPercent >= barProgress;

            return (
              <div
                key={index}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPassed
                    ? isMe
                      ? "bg-sky-400"
                      : "bg-sky-600"
                    : isMe
                    ? "bg-slate-700"
                    : "bg-slate-300"
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

  // Replying state
  const [replyingToMsg, setReplyingToMsg] = useState<ChatMessage | null>(null);

  // Voice recording state
  const [recording, setRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Voice recording handlers
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await sendVoiceMessage(base64Audio);
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setRecordTimer(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordTimer((prev) => prev + 1);
      }, 1000);
    } catch {
      alert("Accès au micro refusé ou non supporté par votre navigateur.");
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
              Ce salon permet à toute la communauté de discuter en texte ou vocal.
            </p>
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
                    {msg.isEdited && (
                      <span className="italic text-slate-400">(modifié)</span>
                    )}
                  </div>

                  {/* QUOTED REPLY PREVIEW INSIDE FEED */}
                  {msg.replyTo && (
                    <div
                      className={`flex items-center gap-1.5 text-xs p-2 px-3 rounded-xl border border-sky-100 bg-sky-50/70 text-slate-600 mb-1 ${
                        msg.isMe ? "text-right justify-end" : "text-left"
                      }`}
                    >
                      <CornerDownRight size={13} className="text-sky-500 shrink-0" />
                      <span className="font-bold text-sky-800">
                        {msg.replyTo.authorName}:
                      </span>
                      <span className="truncate max-w-[180px] italic">
                        "{msg.replyTo.content}"
                      </span>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-1.5 bg-slate-900 p-2 rounded-2xl text-left">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="bg-transparent text-white text-sm outline-none flex-1 px-2"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(msg.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                        title="Enregistrer"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Annuler"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative inline-block text-left">
                      {msg.audioUrl ? (
                        <VoicePlayer src={msg.audioUrl} isMe={msg.isMe} />
                      ) : (
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words inline-block shadow-sm ${
                            msg.isMe
                              ? "bg-slate-950 text-white rounded-tr-none font-medium"
                              : "bg-slate-100 text-slate-800 rounded-tl-none font-medium"
                          }`}
                        >
                          {msg.content}
                        </div>
                      )}

                      {/* LIKES BADGE ON MESSAGE */}
                      {(msg.likesCount || 0) > 0 && (
                        <button
                          onClick={() => handleLikeMessage(msg.id)}
                          className={`absolute -bottom-2 right-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border shadow-sm ${
                            msg.isLikedByMe
                              ? "bg-rose-500 text-white border-rose-600"
                              : "bg-white text-rose-500 border-slate-200"
                          }`}
                        >
                          <Heart size={10} className="fill-current" />
                          <span>{msg.likesCount}</span>
                        </button>
                      )}

                      {/* HOVER OVERLAY ACTIONS */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-3 right-2 flex items-center gap-1 bg-white border border-slate-200 shadow-md rounded-xl px-1.5 py-0.5 z-10">
                        {/* REPLY BUTTON */}
                        <button
                          onClick={() => setReplyingToMsg(msg)}
                          className="p-1 text-slate-400 hover:text-sky-600 transition"
                          title="Répondre / Citer"
                        >
                          <Reply size={13} />
                        </button>

                        {/* LIKE BUTTON */}
                        <button
                          onClick={() => handleLikeMessage(msg.id)}
                          className={`p-1 transition ${
                            msg.isLikedByMe
                              ? "text-rose-500"
                              : "text-slate-400 hover:text-rose-500"
                          }`}
                          title="Réagir"
                        >
                          <Heart size={13} className={msg.isLikedByMe ? "fill-rose-500" : ""} />
                        </button>

                        {/* EDIT / DELETE FOR MY MESSAGES */}
                        {msg.isMe && (
                          <>
                            {!msg.audioUrl && (
                              <button
                                onClick={() => {
                                  setEditingId(msg.id);
                                  setEditText(msg.content);
                                }}
                                className="p-1 text-slate-400 hover:text-sky-600 transition"
                                title="Modifier"
                              >
                                <Edit2 size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1 text-slate-400 hover:text-red-500 transition"
                              title="Supprimer le message"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* REPLIES PREVIEW BAR */}
      {replyingToMsg && (
        <div className="mt-2 flex items-center justify-between rounded-2xl bg-sky-50 border border-sky-100 p-2.5 px-4 text-xs text-sky-900 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Reply size={15} className="text-sky-600 shrink-0" />
            <span>
              En réponse à <strong className="font-bold">{replyingToMsg.author.anonymousName}</strong>:{" "}
              <span className="italic truncate max-w-[200px] text-slate-600">
                "{replyingToMsg.content}"
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setReplyingToMsg(null)}
            className="p-1 text-slate-400 hover:text-slate-700"
            title="Annuler la réponse"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* CHAT INPUT / VOICE RECORDING */}
      {recording ? (
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-3 shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-bold text-red-700">
              Enregistrement en cours... ({recordTimer}s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-200 transition"
            >
              Annuler
            </button>
            <button
              onClick={stopRecording}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition"
            >
              Envoyer le vocal
              <Send size={13} />
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSendMessage}
          className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-md shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              replyingToMsg
                ? `Répondre à ${replyingToMsg.author.anonymousName}...`
                : "Écris ton message anonyme..."
            }
            maxLength={1000}
            className="flex-1 bg-transparent px-3 text-sm font-medium outline-none text-slate-900 placeholder:text-slate-400"
          />

          <button
            type="button"
            onClick={startRecording}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition"
            title="Enregistrer un message vocal"
          >
            <Mic size={18} />
          </button>

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
      )}
    </div>
  );
}
