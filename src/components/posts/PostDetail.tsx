"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Award,
  Eye,
  Heart,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
} from "lucide-react";

type Comment = {
  id: string;
  content: string;
  likesCount: number;
  createdAt: string;
  author: {
    anonymousName: string;
    avatarUrl: string;
  };
};

type Post = {
  id: string;
  title: string;
  content: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  };
  author: {
    anonymousName: string;
    avatarUrl: string;
  };
};

function formatDate(dateStr: string) {
  const value = new Date(dateStr);
  const now = new Date();

  const diff = now.getTime() - value.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days} j`;

  return value.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PostDetail({ postId }: { postId: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUserIdentity, setCurrentUserIdentity] = useState<{
    anonymousName: string;
    avatarUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [likedPost, setLikedPost] = useState(false);
  const [postLikesCount, setPostLikesCount] = useState(0);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadPostDetail() {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Impossible de charger la discussion.");
          return;
        }

        setPost(data.post);
        setComments(data.comments || []);
        setCurrentUserIdentity(data.currentUserIdentity);
        setPostLikesCount(data.post.likesCount);
        setLikedPost(!!data.hasLikedPost);

        if (Array.isArray(data.userLikedCommentIds)) {
          const map: Record<string, boolean> = {};
          data.userLikedCommentIds.forEach((id: string) => {
            map[id] = true;
          });
          setLikedComments(map);
        }
      } catch {
        setError("Impossible de contacter le serveur. Vérifie ta connexion.");
      } finally {
        setLoading(false);
      }
    }

    loadPostDetail();
  }, [postId]);

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommentError("");

    if (!newComment.trim() || newComment.trim().length < 2) {
      setCommentError("Ta réponse doit contenir au moins 2 caractères.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/connexion";
        return;
      }

      if (!response.ok || !data.success) {
        setCommentError(data.message || "Impossible d'envoyer la réponse.");
        return;
      }

      const createdComment: Comment = {
        ...data.comment,
        likesCount: 0,
      };

      setComments((prev) => [...prev, createdComment]);
      setNewComment("");
      if (post) {
        setPost({
          ...post,
          commentsCount: post.commentsCount + 1,
        });
      }
    } catch {
      setCommentError("Erreur lors de l'envoi. Vérifie ta connexion.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleLikePost() {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (response.status === 401) {
        window.location.href = "/connexion";
        return;
      }

      const data = await response.json();
      if (data.success) {
        setLikedPost(data.liked);
        setPostLikesCount(data.likesCount);
      }
    } catch {
      // Ignore transient errors
    }
  }

  async function handleLikeComment(commentId: string) {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });

      if (response.status === 401) {
        window.location.href = "/connexion";
        return;
      }

      const data = await response.json();
      if (data.success) {
        setLikedComments((prev) => ({
          ...prev,
          [commentId]: data.liked,
        }));
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, likesCount: data.likesCount } : c
          )
        );
      }
    } catch {
      // Ignore transient errors
    }
  }

  const maxLikes = Math.max(0, ...comments.map((c) => c.likesCount));
  const topCommentId = maxLikes > 0 ? comments.find((c) => c.likesCount === maxLikes)?.id : null;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-10 w-36 animate-pulse rounded-full bg-white/10" />
        <div className="h-64 animate-pulse rounded-3xl bg-white/10 p-6" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-xl shadow-2xl text-white">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-red-300 font-bold text-xl">
          !
        </div>
        <h1 className="mt-4 text-xl font-bold text-white">
          Discussion introuvable
        </h1>
        <p className="mt-2 text-xs text-cyan-100/80">{error}</p>
        <Link
          href="/accueil"
          className="mt-6 inline-flex rounded-full bg-cyan-400 px-6 py-3 text-xs font-black uppercase text-slate-950 shadow-lg shadow-cyan-400/40"
        >
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20 text-white">
      {/* NAVIGATION HEADER */}
      <div className="flex items-center justify-between">
        <Link
          href="/accueil"
          className="inline-flex items-center gap-2 text-xs font-bold text-cyan-200 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Retour aux discussions
        </Link>

        <span className="shrink-0 rounded-full bg-cyan-400/20 border border-cyan-400/40 px-3.5 py-1 text-xs font-bold text-cyan-300">
          {post.category.icon || "💬"} {post.category.name}
        </span>
      </div>

      {/* POST CARD */}
      <article className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatarUrl}
              alt={post.author.anonymousName}
              className="h-11 w-11 rounded-full border border-cyan-400/30"
            />
            <div>
              <p className="text-sm font-bold text-white">
                {post.author.anonymousName}
              </p>
              <p className="text-[11px] text-cyan-200/70">
                Auteur · {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          <span className="flex items-center gap-1 text-xs font-semibold text-cyan-300 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/30">
            <ShieldCheck size={14} />
            Anonyme
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-black leading-snug text-white sm:text-3xl drop-shadow-md">
          {post.title}
        </h1>

        <div className="mt-4 whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-cyan-50">
          {post.content}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-sm">
          <div className="flex items-center gap-6 text-cyan-200/80">
            <span className="flex items-center gap-2 font-semibold">
              <MessageCircle size={18} className="text-cyan-400" />
              {post.commentsCount} réponses
            </span>

            <button
              onClick={toggleLikePost}
              className={`flex items-center gap-2 font-bold transition ${
                likedPost ? "text-rose-400" : "text-cyan-200/80 hover:text-rose-400"
              }`}
            >
              <Heart size={18} className={likedPost ? "fill-rose-400 text-rose-400" : ""} />
              {postLikesCount}
            </button>

            <span className="flex items-center gap-2 font-semibold">
              <Eye size={18} className="text-cyan-300" />
              {post.viewsCount} vues
            </span>
          </div>
        </div>
      </article>

      {/* COMMENTS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white">
            Pistes & Réponses ({comments.length})
          </h2>
          <p className="text-xs text-cyan-200">
            Votez pour guider vers la meilleure solution 💡
          </p>
        </div>

        {/* ADD COMMENT FORM */}
        <form
          onSubmit={handleCommentSubmit}
          className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl space-y-4"
        >
          {commentError && (
            <div
              role="alert"
              className="rounded-2xl border border-red-400/40 bg-red-500/20 px-4 py-2.5 text-xs font-bold text-red-200"
            >
              {commentError}
            </div>
          )}

          <div className="flex items-start gap-3">
            {currentUserIdentity ? (
              <img
                src={currentUserIdentity.avatarUrl}
                alt={currentUserIdentity.anonymousName}
                className="h-9 w-9 rounded-full mt-1 shrink-0 border border-cyan-400/40"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white mt-1 shrink-0">
                ?
              </div>
            )}

            <div className="flex-1">
              <textarea
                required
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Apporte ton aide, propose ta solution ou partage ton expérience..."
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:ring-4 focus:ring-cyan-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-cyan-200 flex items-center gap-1">
              <Sparkles size={14} className="text-amber-300" />
              Réponse publiée sous votre profil anonyme.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-400 hover:bg-cyan-300 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition shadow-lg shadow-cyan-400/30 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  Partager cette piste
                  <Send size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* COMMENTS LIST */}
        {comments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-8 text-center backdrop-blur-xl">
            <MessageCircle size={28} className="mx-auto text-cyan-300 mb-2" />
            <p className="font-bold text-white text-sm">
              Aucune réponse pour l'instant
            </p>
            <p className="text-xs text-cyan-200 mt-1">
              Sois le premier membre à proposer une solution ou un conseil éclairé !
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const isTop = comment.id === topCommentId;
              const isLikedByMe = !!likedComments[comment.id];

              return (
                <div
                  key={comment.id}
                  className={`rounded-3xl border p-5 shadow-xl backdrop-blur-xl space-y-3 transition ${
                    isTop
                      ? "border-emerald-400/60 bg-emerald-950/30 ring-1 ring-emerald-400/40"
                      : "border-white/20 bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={comment.author.avatarUrl}
                        alt={comment.author.anonymousName}
                        className="h-9 w-9 rounded-full border border-cyan-400/30"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">
                          {comment.author.anonymousName}
                        </p>
                        <p className="text-[10px] text-cyan-200/70">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>

                    {isTop && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-300">
                        <Award size={14} />
                        Meilleure piste conseillée
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-cyan-50 pl-12 whitespace-pre-wrap">
                    {comment.content}
                  </p>

                  <div className="flex items-center justify-between pl-12 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition ${
                        isLikedByMe
                          ? "bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/30"
                          : "bg-white/10 text-cyan-200 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      <ThumbsUp size={13} className={isLikedByMe ? "fill-slate-950" : ""} />
                      <span>{isLikedByMe ? "Soutenu" : "Utile"} ({comment.likesCount})</span>
                    </button>

                    <span className="text-[10px] text-cyan-200/70 font-medium">
                      {comment.likesCount > 0
                        ? `Soutenu par ${comment.likesCount} membre${
                            comment.likesCount > 1 ? "s" : ""
                          }`
                        : "Soutenez cette réponse si elle vous semble utile"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
