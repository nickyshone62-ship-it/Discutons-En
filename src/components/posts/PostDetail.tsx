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

  function toggleLikePost() {
    if (!likedPost) {
      setLikedPost(true);
      setPostLikesCount((prev) => prev + 1);
    } else {
      setLikedPost(false);
      setPostLikesCount((prev) => prev - 1);
    }
  }

  async function handleLikeComment(commentId: string) {
    const isLiked = likedComments[commentId];

    // Optimistic UI update
    setLikedComments((prev) => ({ ...prev, [commentId]: !isLiked }));
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, likesCount: isLiked ? c.likesCount - 1 : c.likesCount + 1 }
          : c
      )
    );

    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });
      if (res.status === 401) {
        window.location.href = "/connexion";
        return;
      }
      const data = await res.json();
      if (data.success) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, likesCount: data.likesCount } : c
          )
        );
      }
    } catch {
      // Revert if error
      setLikedComments((prev) => ({ ...prev, [commentId]: isLiked }));
    }
  }

  // Find highest voted comment to highlight as best advice
  const maxLikes = Math.max(0, ...comments.map((c) => c.likesCount));
  const topCommentId = maxLikes > 0 ? comments.find((c) => c.likesCount === maxLikes)?.id : null;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-64 animate-pulse rounded-3xl bg-white p-6" />
        <div className="h-40 animate-pulse rounded-3xl bg-white p-6" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 font-bold text-xl">
          !
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-950">
          Discussion introuvable
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {error || "Ce problème n'existe pas ou a été supprimé."}
        </p>
        <Link
          href="/accueil"
          className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
        >
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      {/* NAVIGATION HEADER */}
      <div className="flex items-center justify-between">
        <Link
          href="/accueil"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Retour aux discussions
        </Link>

        <span className="shrink-0 rounded-xl bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">
          {post.category.icon || "💬"} {post.category.name}
        </span>
      </div>

      {/* POST CARD */}
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatarUrl}
              alt={post.author.anonymousName}
              className="h-11 w-11 rounded-full border border-slate-100"
            />
            <div>
              <p className="text-sm font-bold text-slate-900">
                {post.author.anonymousName}
              </p>
              <p className="text-xs text-slate-400">
                Auteur · {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          <span className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
            <ShieldCheck size={14} className="text-sky-500" />
            Anonyme
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-black leading-snug text-slate-950 sm:text-3xl">
          {post.title}
        </h1>

        <div className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-slate-700">
          {post.content}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 text-sm">
          <div className="flex items-center gap-6 text-slate-400">
            <span className="flex items-center gap-2 font-medium">
              <MessageCircle size={18} />
              {post.commentsCount} réponses
            </span>

            <button
              onClick={toggleLikePost}
              className={`flex items-center gap-2 font-semibold transition ${
                likedPost ? "text-rose-500" : "text-slate-400 hover:text-rose-500"
              }`}
            >
              <Heart size={18} className={likedPost ? "fill-rose-500 text-rose-500" : ""} />
              {postLikesCount}
            </button>

            <span className="flex items-center gap-2 font-medium">
              <Eye size={18} />
              {post.viewsCount} vues
            </span>
          </div>
        </div>
      </article>

      {/* COMMENTS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-950">
            Pistes & Réponses ({comments.length})
          </h2>
          <p className="text-xs text-slate-400">
            Votez pour guider vers la meilleure solution 💡
          </p>
        </div>

        {/* ADD COMMENT FORM */}
        <form
          onSubmit={handleCommentSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
        >
          {commentError && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700"
            >
              {commentError}
            </div>
          )}

          <div className="flex items-start gap-3">
            {currentUserIdentity ? (
              <img
                src={currentUserIdentity.avatarUrl}
                alt={currentUserIdentity.anonymousName}
                className="h-9 w-9 rounded-full mt-1 shrink-0"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 mt-1 shrink-0">
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
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles size={14} className="text-amber-500" />
              Réponse publiée sous votre profil anonyme.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  Partager cette piste
                  <Send size={15} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* COMMENTS LIST */}
        {comments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <MessageCircle size={28} className="mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700 text-sm">
              Aucune réponse pour l'instant
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Sois le premier membre à proposer une solution ou un conseil éclairé !
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const isTop = comment.id === topCommentId;
              const isLikedByMe = likedComments[comment.id];

              return (
                <div
                  key={comment.id}
                  className={`rounded-3xl border p-5 shadow-sm space-y-3 transition ${
                    isTop
                      ? "border-emerald-200 bg-emerald-50/40 ring-1 ring-emerald-300/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={comment.author.avatarUrl}
                        alt={comment.author.anonymousName}
                        className="h-9 w-9 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {comment.author.anonymousName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>

                    {isTop && (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                        <Award size={14} className="text-emerald-600" />
                        Meilleure piste conseillée
                      </span>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-slate-700 pl-12 whitespace-pre-wrap">
                    {comment.content}
                  </p>

                  <div className="flex items-center justify-between pl-12 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        isLikedByMe
                          ? "bg-sky-100 text-sky-700"
                          : "bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-600"
                      }`}
                    >
                      <ThumbsUp
                        size={14}
                        className={isLikedByMe ? "fill-sky-700" : ""}
                      />
                      <span>Utile ({comment.likesCount})</span>
                    </button>

                    <span className="text-[11px] text-slate-400">
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
