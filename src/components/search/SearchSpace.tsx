"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, Heart, MessageCircle, Search, Sparkles } from "lucide-react";

type Post = {
  id: string;
  title: string;
  content: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  category: {
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
  return value.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function SearchSpace() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setPosts(data.posts || []);
        }
      } catch {
        // silent error
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 text-white space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <Link
          href="/accueil"
          className="inline-flex items-center gap-2 text-xs font-bold text-cyan-200 hover:text-white transition"
        >
          <ArrowLeft size={16} />
          Retour à l'accueil
        </Link>
        <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/30">
          <Sparkles size={14} className="text-amber-300" />
          Recherche Instantanée
        </span>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Recherche par mot-clé, sujet ou catégorie..."
          className="w-full rounded-3xl border border-white/20 bg-slate-950/80 pl-12 pr-6 py-4 text-base font-medium text-white placeholder:text-cyan-200/50 outline-none backdrop-blur-2xl shadow-2xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition"
          autoFocus
        />
      </div>

      {/* RESULTS FEED */}
      <div className="space-y-4">
        {loading ? (
          <div className="h-32 animate-pulse rounded-3xl bg-white/10" />
        ) : posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-10 text-center backdrop-blur-2xl">
            <Search size={36} className="mx-auto text-cyan-300 mb-3" />
            <h3 className="font-black font-display text-white text-lg">
              Aucun résultat trouvé
            </h3>
            <p className="text-xs font-medium text-cyan-100/80 mt-1">
              Essaie d'autres mots-clés pour trouver une discussion pertinente.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="rounded-3xl border border-white/20 bg-white/10 p-5 sm:p-6 shadow-xl backdrop-blur-2xl transition hover:border-cyan-400/50 hover:bg-white/15"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.anonymousName}
                    className="h-10 w-10 rounded-full border border-cyan-400/40"
                  />
                  <div>
                    <p className="text-xs font-black font-display text-white">
                      {post.author.anonymousName}
                    </p>
                    <p className="text-[10px] text-cyan-200/70">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-cyan-400/20 border border-cyan-400/40 px-3 py-1 text-xs font-bold text-cyan-300">
                  {post.category.icon || "💬"} {post.category.name}
                </span>
              </div>

              <Link href={`/probleme/${post.id}`} className="mt-4 block group">
                <h3 className="text-lg font-black font-display text-white group-hover:text-cyan-300 transition">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs sm:text-sm text-cyan-100/80 font-medium">
                  {post.content}
                </p>
              </Link>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-bold text-cyan-200/80">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <MessageCircle size={15} className="text-cyan-400" />
                    {post.commentsCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={15} className="text-rose-400" />
                    {post.likesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={15} className="text-cyan-300" />
                    {post.viewsCount}
                  </span>
                </div>

                <Link
                  href={`/probleme/${post.id}`}
                  className="text-xs font-black font-display text-cyan-300 hover:text-white"
                >
                  Voir la discussion →
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
