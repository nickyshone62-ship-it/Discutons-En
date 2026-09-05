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
    <div className="mx-auto max-w-4xl px-4 py-6 flex flex-col h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] font-sans text-white">
      {/* CHAT HEADER */}
      <div className="mb-4 flex items-center justify-between rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/accueil"
            className="rounded-2xl p-2.5 text-cyan-200 hover:bg-white/15 hover:text-white transition"
            title="Retour à l'accueil"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shadow-inner">
            <MessageSquare size={22} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black font-display tracking-tight text-white">
                Salon Communautaire en Direct
              </h1>
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            </div>
            <p className="text-xs font-medium text-cyan-100/80">
              Échanges instantanés en direct entre membres anonymes
            </p>
          </div>
        </div>

        {currentUser && (
          <div className="hidden sm:flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-1.5 border border-white/20">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.anonymousName}
              className="h-7 w-7 rounded-full border border-cyan-400/60"
            />
            <div className="text-left">
              <p className="text-xs font-black font-display text-white leading-tight">
                {currentUser.anonymousName}
              </p>
              <p className="text-[10px] text-cyan-300 font-bold leading-tight">
                Identité Anonyme
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ANONYMITY BANNER */}
      <div className="mb-3 rounded-2xl bg-cyan-400/10 px-4 py-2.5 border border-cyan-400/30 flex items-center justify-between text-xs text-cyan-100 backdrop-blur-md shrink-0">
        <span className="flex items-center gap-2 font-bold">
          <ShieldCheck size={16} className="text-cyan-300" />
          Votre identité réelle reste masquée. Tous les messages sont 100% anonymisés.
        </span>
        <span className="hidden md:flex items-center gap-1.5 text-amber-300 font-bold text-xs">
          <Sparkles size={14} />
          Bienveillance & Respect
        </span>
      </div>

      {/* MESSAGES FEED */}
      <div className="flex-1 overflow-y-auto rounded-3xl border border-white/20 bg-slate-950/60 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 mb-3">
              <Users size={30} />
            </div>
            <h3 className="font-black font-display text-white text-lg">
              Soyez le premier à envoyer un message !
            </h3>
            <p className="text-xs font-medium text-cyan-100/80 max-w-xs mt-1 leading-relaxed">
              Ce salon vous permet d'échanger directement en texte ou via des vocaux instantanés.
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
                  className="h-9 w-9 rounded-full shrink-0 mt-1 border border-cyan-400/40 shadow-md"
                />

                <div
                  className={`max-w-[80%] sm:max-w-[68%] space-y-1 ${
                    msg.isMe ? "items-end text-right" : "items-start text-left"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 text-[11px] font-bold text-cyan-200/80 ${
                      msg.isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className="font-display">{msg.author.anonymousName}</span>
                    <span>·</span>
                    <span className="text-[10px] font-sans font-normal opacity-80">{formatTime(msg.createdAt)}</span>
                    {msg.isEdited && (
                      <span className="italic text-cyan-300/80 text-[10px]">(modifié)</span>
                    )}
                  </div>

                  {/* QUOTED REPLY PREVIEW INSIDE FEED */}
                  {msg.replyTo && (
                    <div
                      className={`flex items-center gap-2 text-xs p-2 px-3 rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-100 mb-1 backdrop-blur-md ${
                        msg.isMe ? "text-right justify-end" : "text-left"
                      }`}
                    >
                      <CornerDownRight size={13} className="text-cyan-300 shrink-0" />
                      <span className="font-black font-display text-cyan-300">
                        {msg.replyTo.authorName}:
                      </span>
                      <span className="truncate max-w-[200px] italic font-medium">
                        "{msg.replyTo.content}"
                      </span>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-400 p-2 rounded-2xl text-left shadow-lg backdrop-blur-xl">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="bg-transparent text-white text-base outline-none flex-1 px-2 font-medium"
                        autoFocus
                      />

                      <button
                        onClick={() => handleSaveEdit(msg.id)}
                        className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition font-bold"
                        title="Enregistrer"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white transition"
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
                          className={`rounded-3xl px-4.5 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words inline-block shadow-lg ${
                            msg.isMe
                              ? "bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 font-semibold rounded-tr-none shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                              : "bg-white/10 text-white font-medium rounded-tl-none border border-white/15 backdrop-blur-xl"
                          }`}
                        >
                          {msg.content}
                        </div>
                      )}

                      {/* LIKES BADGE ON MESSAGE */}
                      {(msg.likesCount || 0) > 0 && (
                        <button
                          onClick={() => handleLikeMessage(msg.id)}
                          className={`absolute -bottom-2 right-2 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black border shadow-lg transition transform active:scale-95 ${
                            msg.isLikedByMe
                              ? "bg-rose-500 text-white border-rose-400 shadow-rose-500/40"
                              : "bg-slate-900/90 text-rose-400 border-white/20"
                          }`}
                        >
                          <Heart size={11} className="fill-current" />
                          <span>{msg.likesCount}</span>
                        </button>
                      )}

                      {/* TOUCH & HOVER ACTIONS TOOLBAR */}
                      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all absolute -top-3.5 right-1 flex items-center gap-1 bg-slate-900/95 border border-cyan-400/50 backdrop-blur-xl shadow-2xl rounded-full px-2.5 py-1 z-10">
                        {/* REPLY BUTTON */}
                        <button
                          onClick={() => setReplyingToMsg(msg)}
                          className="p-1 text-cyan-300 hover:text-white transition active:scale-90"
                          title="Répondre / Citer"
                        >
                          <Reply size={13} />
                        </button>

                        {/* LIKE BUTTON */}
                        <button
                          onClick={() => handleLikeMessage(msg.id)}
                          className={`p-1 transition active:scale-90 ${
                            msg.isLikedByMe
                              ? "text-rose-400"
                              : "text-slate-400 hover:text-rose-400"
                          }`}
                          title="Réagir"
                        >
                          <Heart size={13} className={msg.isLikedByMe ? "fill-rose-400" : ""} />
                        </button>

                        {/* EDIT & DELETE FOR MY MESSAGES (TEXT & VOICE) */}
                        {msg.isMe && (
                          <>
                            {!msg.audioUrl && (
                              <button
                                onClick={() => {
                                  setEditingId(msg.id);
                                  setEditText(msg.content);
                                }}
                                className="p-1 text-cyan-300 hover:text-white transition active:scale-90"
                                title="Modifier le message"
                              >
                                <Edit2 size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1 text-red-400 hover:text-red-300 transition active:scale-90"
                              title="Supprimer le message"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* MOBILE-SPECIFIC EXPLICIT ACTION BAR FOR MY MESSAGES */}
                  {msg.isMe && !isEditing && (
                    <div className="flex items-center justify-end gap-3 pt-0.5 text-[11px] text-cyan-200/80 font-bold sm:hidden">
                      {!msg.audioUrl && (
                        <button
                          onClick={() => {
                            setEditingId(msg.id);
                            setEditText(msg.content);
                          }}
                          className="flex items-center gap-1 text-cyan-300 hover:text-white active:scale-95 transition"
                        >
                          <Edit2 size={12} />
                          <span>Modifier</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="flex items-center gap-1 text-red-400 hover:text-red-300 active:scale-95 transition"
                      >
                        <Trash2 size={12} />
                        <span>Supprimer</span>
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

      {/* REPLIES PREVIEW BAR */}
      {replyingToMsg && (
        <div className="mt-2 flex items-center justify-between rounded-2xl bg-cyan-400/15 border border-cyan-400/30 p-3 px-4 text-xs text-cyan-100 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-2 truncate">
            <Reply size={15} className="text-cyan-300 shrink-0" />
            <span>
              En réponse à <strong className="font-bold text-white">{replyingToMsg.author.anonymousName}</strong>:{" "}
              <span className="italic truncate max-w-[220px] text-cyan-200/80">
                "{replyingToMsg.content}"
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setReplyingToMsg(null)}
            className="p-1 text-cyan-300 hover:text-white"
            title="Annuler la réponse"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* CHAT INPUT / VOICE RECORDING */}
      {recording ? (
        <div className="mt-3 flex items-center justify-between rounded-3xl border border-red-500/40 bg-red-950/50 p-3.5 px-5 shadow-2xl backdrop-blur-2xl shrink-0">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black font-display tracking-wider text-red-200">
              ENREGISTREMENT VOCAL ({recordTimer}s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              className="rounded-full px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              Annuler
            </button>
            <button
              onClick={stopRecording}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-xs font-black font-display uppercase tracking-widest text-white hover:bg-red-500 transition shadow-lg shadow-red-600/40"
            >
              Envoyer
              <Send size={14} />
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSendMessage}
          className="mt-3 flex items-center gap-2.5 rounded-full border border-white/20 bg-slate-950/80 p-2 px-3 shadow-2xl backdrop-blur-2xl shrink-0"
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
            className="flex-1 bg-transparent px-4 text-base font-medium outline-none text-white placeholder:text-cyan-200/50"
          />

          <button
            type="button"
            onClick={startRecording}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-cyan-300 hover:bg-white/20 hover:text-white transition border border-white/15"
            title="Enregistrer un message vocal"
          >
            <Mic size={19} />
          </button>

          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 transition transform active:scale-95 disabled:opacity-40 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            title="Envoyer le message"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} className="ml-0.5" />
            )}
          </button>
        </form>
      )}
    </div>
  );
}

