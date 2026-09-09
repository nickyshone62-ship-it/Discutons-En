"use client";

import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  Eye,
  Heart,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
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
    name: string;
    slug: string;
    icon: string | null;
  };
  author: {
    anonymousName: string;
    avatarUrl: string;
  };
};

type RecentMessage = {
  id: string;
  userId: string;
  content: string;
  audioUrl: string | null;
  createdAt: string;
  isMe: boolean;
  author: {
    anonymousName: string;
    avatarUrl: string;
  };
};

type HomeData = {
  user: {
    id: string;
    username: string;
    email: string;
    role?: string;
  };
  identity: {
    anonymousName: string;
    avatarUrl: string;
  };
  categories: Category[];
  posts: Post[];
  unreadCount?: number;
  recentMessages?: RecentMessage[];
};

function formatDate(date: string) {
  const value = new Date(date);
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
  });
}

function getCategoryIcon(icon: string | null) {
  return icon || "💬";
}

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchHome(isFirstLoad = false) {
      try {
        const response = await fetch("/api/home", {
          cache: "no-store",
        });

        const result = await response.json();

        if (response.status === 401) {
          window.location.href = "/connexion";
          return;
        }

        if (response.ok && result.success) {
          setData(result);
        } else if (isFirstLoad) {
          setError(
            result.message || "Impossible de charger votre espace."
          );
        }
      } catch {
        if (isFirstLoad) {
          setError(
            "Impossible de contacter le serveur. Vérifie ta connexion."
          );
        }
      } finally {
        if (isFirstLoad) setLoading(false);
      }
    }

    fetchHome(true);

    const interval = setInterval(() => {
      fetchHome(false);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#fdf8fa] via-[#faedf3] to-[#f7e4ed] p-6 text-slate-900 font-sans">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="h-16 animate-pulse rounded-3xl bg-white/60 border border-pink-100" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
            <div className="hidden h-96 animate-pulse rounded-3xl bg-white/60 border border-pink-100 lg:block" />
            <div className="space-y-4">
              <div className="h-40 animate-pulse rounded-3xl bg-white/60 border border-pink-100" />
              <div className="h-48 animate-pulse rounded-3xl bg-white/60 border border-pink-100" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fdf8fa] via-[#faedf3] to-[#f7e4ed] px-4 text-slate-900 font-sans">
        <div className="w-full max-w-md rounded-3xl border border-pink-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 font-bold text-xl border border-red-200">
            !
          </div>
          <h1 className="mt-5 text-xl font-extrabold font-display tracking-wide text-slate-900">
            Une erreur est survenue
          </h1>
          <p className="mt-2 text-xs font-semibold text-slate-600">
            {error || "Impossible de charger votre espace."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full btn-pink px-6 py-3 text-xs font-extrabold font-display uppercase tracking-widest shadow-md"
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#fdf8fa] via-[#faedf3] to-[#f7e4ed] text-slate-900 pb-24 overflow-x-hidden font-sans">
      {/* GEOMETRIC BACKGROUND DECORATIONS MATCHING LANDING PAGE */}
      <div className="pointer-events-none fixed -top-24 -left-24 h-96 w-96 rounded-full bg-rose-200/50 opacity-80 blur-3xl" />
      <div className="pointer-events-none fixed top-12 left-1/3 h-28 w-28 rounded-full bg-pink-300/40 blur-2xl" />
      <div className="pointer-events-none fixed bottom-10 right-10 h-96 w-96 rounded-full bg-rose-200/60 opacity-80 blur-3xl" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-pink-100/80 bg-white/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo variant="horizontal" size="md" href="/accueil" />

          <div className="hidden items-center gap-3 md:flex">
            {(data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN") && (
              <Link
                href="/admin"
                className="flex h-10 items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-pink-100 transition shadow-sm"
              >
                <ShieldCheck size={16} className="text-[#ff2a6d]" />
                Admin
              </Link>
            )}

            <Link
              href="/chat"
              className="flex h-10 items-center gap-2 rounded-full btn-pink px-4.5 text-xs font-black font-display uppercase tracking-wider transition shadow-md transform active:scale-95 text-white"
            >
              <MessageSquare size={16} />
              Chat en direct
            </Link>

            <Link
              href="/recherche"
              className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Search size={16} />
              Rechercher
            </Link>

            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff2a6d] animate-ping" />
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            <Link
              href="/compte"
              className="flex items-center gap-2.5 rounded-full border border-pink-200 bg-white p-1 px-3.5 hover:bg-pink-50 transition hover:scale-105 duration-300 shadow-sm"
              title="Mon compte"
            >
              <img
                src={data.identity.avatarUrl}
                alt={data.identity.anonymousName}
                className="h-8 w-8 rounded-full border-2 border-[#ff2a6d]"
              />
              <div className="hidden text-left lg:block">
                <p className="text-xs font-black text-slate-900 leading-tight font-display">
                  {data.identity.anonymousName}
                </p>
                <p className="text-[10px] text-[#ff2a6d] font-bold">
                  Mon compte →
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition"
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              <LogOut size={18} />
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-pink-100 bg-white px-4 py-4 backdrop-blur-2xl md:hidden">
            <Link
              href="/compte"
              onClick={() => setMenuOpen(false)}
              className="mb-4 flex items-center gap-3 rounded-2xl border border-pink-200 bg-pink-50 p-3"
            >
              <img
                src={data.identity.avatarUrl}
                alt={data.identity.anonymousName}
                className="h-11 w-11 rounded-full border-2 border-[#ff2a6d]"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {data.identity.anonymousName}
                </p>
                <p className="text-xs text-[#ff2a6d] font-bold">
                  Gérer mon compte →
                </p>
              </div>
            </Link>

            <div className="space-y-2">
              {(data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN") && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl bg-pink-50 border border-pink-200 px-4 py-3 text-sm font-extrabold text-[#ff2a6d]"
                >
                  <ShieldCheck size={18} />
                  Espace Administrateur 🛡️
                </Link>
              )}

              <Link
                href="/accueil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-[#f4f3f6] px-4 py-3 text-sm font-bold text-slate-800"
              >
                <Home size={18} />
                Accueil
              </Link>

              <Link
                href="/chat"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl btn-pink px-4 py-3 text-sm font-black text-white uppercase font-display"
              >
                <MessageSquare size={18} />
                Chat en direct
              </Link>

              <Link
                href="/recherche"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-[#f4f3f6] px-4 py-3 text-sm font-bold text-slate-800"
              >
                <Search size={18} />
                Rechercher
              </Link>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl bg-red-50 px-4 py-3 text-left text-sm font-bold text-red-600"
              >
                <LogOut size={18} />
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </header>

      {/* CONTENT GRID */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)_260px]">
          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-3xl border border-pink-100/80 bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.04)] space-y-2">
                <Link
                  href="/accueil"
                  className="flex items-center gap-3 rounded-2xl bg-pink-50 border border-pink-200 px-4 py-3 text-sm font-extrabold font-display text-[#ff2a6d]"
                >
                  <Home size={18} className="text-[#ff2a6d]" />
                  Accueil
                </Link>

                <Link
                  href="/chat"
                  className="flex items-center gap-3 rounded-2xl btn-pink px-4 py-3 text-sm font-black font-display text-white uppercase tracking-wider transition shadow-md hover:scale-[1.02] duration-300"
                >
                  <MessageSquare size={18} />
                  Chat en direct
                </Link>

                <Link
                  href="/recherche"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Search size={18} />
                  Rechercher
                </Link>
              </div>

              {/* CATEGORIES CARD */}
              <div className="rounded-3xl border border-pink-100/80 bg-white p-4.5 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
                <h2 className="mb-3 text-xs font-extrabold font-display uppercase tracking-widest text-[#ff2a6d]">
                  Catégories
                </h2>

                <div className="space-y-1">
                  {data.categories.map((category) => (
                    <button
                      key={category.id}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-slate-700 transition hover:bg-pink-50 hover:text-[#ff2a6d]"
                    >
                      <span className="text-base">
                        {getCategoryIcon(category.icon)}
                      </span>
                      <span className="truncate">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN FEED SECTION */}
          <section className="min-w-0 space-y-6">
            {/* HERO WELCOME BANNER */}
            <div className="relative overflow-hidden rounded-[28px] border border-pink-200 bg-gradient-to-r from-[#ff2a6d] via-[#ff4b7d] to-[#ff6699] p-6 text-white shadow-xl sm:p-8">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/20 blur-2xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <img
                    src={data.identity.avatarUrl}
                    alt={data.identity.anonymousName}
                    className="h-12 w-12 rounded-full border-2 border-white shadow-md"
                  />
                  <div>
                    <p className="text-xs font-semibold text-pink-100">
                      Bienvenue
                    </p>
                    <p className="font-black font-display text-white text-base">
                      {data.identity.anonymousName}
                    </p>
                  </div>
                </div>

                <h1 className="mt-4 max-w-xl text-2xl font-extrabold font-display tracking-tight sm:text-3xl text-white">
                  Quel problème veux-tu partager aujourd'hui ?
                </h1>

                <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-pink-100 font-medium">
                  Exprime-toi librement. La communauté est là pour t'écouter, échanger et trouver la meilleure voie avec toi.
                </p>

                <Link
                  href="/publier"
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white text-[#ff2a6d] hover:bg-pink-50 px-7 py-3.5 text-xs font-extrabold font-display uppercase tracking-widest shadow-lg transition transform hover:scale-[1.02] active:scale-95 duration-300"
                >
                  <Plus size={18} />
                  Partager un problème
                </Link>
              </div>
            </div>

            {/* MOBILE CATEGORIES */}
            <div className="lg:hidden">
              <h2 className="mb-2 text-xs font-black font-display uppercase tracking-widest text-[#ff2a6d]">
                Catégories
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {data.categories.map((category) => (
                  <button
                    key={category.id}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm"
                  >
                    <span>{getCategoryIcon(category.icon)}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* POSTS LIST */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black font-display uppercase tracking-widest text-[#ff2a6d]">
                    Communauté
                  </p>
                  <h2 className="text-2xl font-extrabold font-display text-slate-900">
                    Problèmes récents
                  </h2>
                </div>

                <button className="flex items-center gap-1 text-xs font-bold text-[#ff2a6d] hover:text-pink-700 transition">
                  Voir tout
                  <ChevronRight size={16} />
                </button>
              </div>

              {data.posts.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-pink-200 bg-white p-10 text-center shadow-sm">
                  <MessageCircle size={36} className="mx-auto text-[#ff2a6d] mb-3" />
                  <h3 className="font-extrabold font-display text-slate-900 text-lg">
                    Aucun problème pour le moment
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-xs font-medium text-slate-500">
                    Sois le premier à partager quelque chose avec la communauté.
                  </p>
                  <Link
                    href="/publier"
                    className="mt-6 inline-flex items-center gap-2 rounded-2xl btn-pink px-6 py-3 text-xs font-black font-display uppercase text-white shadow-md"
                  >
                    <Plus size={16} />
                    Publier un problème
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.posts.map((post) => (
                    <article
                      key={post.id}
                      className="rounded-[28px] border border-pink-100/80 bg-white p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-[#ff2a6d]/40 hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={post.author.avatarUrl}
                            alt={post.author.anonymousName}
                            className="h-10 w-10 shrink-0 rounded-full border border-pink-200 shadow-sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-extrabold font-display text-slate-900">
                              {post.author.anonymousName}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-400">
                              {formatDate(post.createdAt)}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full bg-pink-50 border border-pink-200 px-3.5 py-1 text-xs font-extrabold text-[#ff2a6d]">
                          {getCategoryIcon(post.category.icon)}{" "}
                          {post.category.name}
                        </span>
                      </div>

                      <Link
                        href={`/probleme/${post.id}`}
                        className="mt-4 block group"
                      >
                        <h3 className="text-lg sm:text-xl font-extrabold font-display leading-snug text-slate-900 transition group-hover:text-[#ff2a6d]">
                          {post.title}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">
                          {post.content}
                        </p>
                      </Link>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-5 text-xs font-bold text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <MessageCircle size={16} className="text-[#ff2a6d]" />
                            {post.commentsCount}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Heart size={16} className="text-[#ff2a6d]" />
                            {post.likesCount}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Eye size={16} className="text-slate-400" />
                            {post.viewsCount}
                          </span>
                        </div>

                        <Link
                          href={`/probleme/${post.id}`}
                          className="text-xs font-black font-display text-[#ff2a6d] hover:underline transition"
                        >
                          Voir la discussion →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              {/* RECENT MESSAGES CARD */}
              <div className="rounded-3xl border border-pink-100/80 bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.04)] space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold font-display uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#ff2a6d]" />
                    Messages Récents
                  </h3>

                  {data.unreadCount && data.unreadCount > 0 ? (
                    <span className="flex h-5 px-2 items-center justify-center rounded-full bg-[#ff2a6d] text-[10px] font-black text-white animate-pulse">
                      {data.unreadCount} non lus
                    </span>
                  ) : null}
                </div>

                {data.recentMessages && data.recentMessages.length > 0 ? (
                  <div className="space-y-2.5">
                    {data.recentMessages.map((msg) => (
                      <Link
                        key={msg.id}
                        href="/chat"
                        className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-[#f4f3f6] p-2.5 transition hover:bg-pink-50 hover:border-pink-200"
                      >
                        <img
                          src={msg.author.avatarUrl}
                          alt={msg.author.anonymousName}
                          className="h-8 w-8 rounded-full shrink-0 border border-pink-300 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-900 truncate">
                              {msg.author.anonymousName}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 truncate">
                            {msg.audioUrl ? "🎙️ Message vocal" : msg.content}
                          </p>
                        </div>
                      </Link>
                    ))}

                    <Link
                      href="/chat"
                      className="block text-center text-xs font-black font-display text-[#ff2a6d] hover:underline pt-1 transition"
                    >
                      Ouvrir le chat →
                    </Link>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucun message récent.</p>
                )}
              </div>

              <div className="rounded-3xl border border-pink-100/80 bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.04)] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-50 text-[#ff2a6d] border border-pink-100">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-xs font-extrabold font-display uppercase text-slate-900">
                      Anonymat garanti
                    </h2>
                    <p className="text-[10px] font-bold text-[#ff2a6d]">Toujours protégé</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-600 font-medium">
                  Les autres membres voient uniquement ton pseudonyme anonyme attribué. Tes données personnelles sont privées.
                </p>
              </div>

              <div className="rounded-3xl border border-pink-100/80 bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.04)] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-50 text-[#ff2a6d] border border-pink-100">
                    <Sparkles size={19} />
                  </div>
                  <div>
                    <h2 className="text-xs font-extrabold font-display uppercase text-slate-900">
                      Bienveillance
                    </h2>
                    <p className="text-[10px] font-bold text-[#ff2a6d]">Notre priorité</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-600 font-medium">
                  Échange avec respect et empathie. Chaque problème mérite d'être écouté sans jugement.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-pink-100 bg-white/95 px-4 py-2 backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <Link
            href="/accueil"
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-[#ff2a6d]"
          >
            <Home size={20} />
            <span className="text-[10px] font-bold">Accueil</span>
          </Link>

          <Link
            href="/chat"
            className="relative flex flex-col items-center gap-1 px-3 py-1.5 text-slate-600 hover:text-[#ff2a6d]"
          >
            <MessageSquare size={20} />
            {data.unreadCount && data.unreadCount > 0 ? (
              <span className="absolute top-0 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff2a6d] text-[9px] font-black text-white shadow-sm animate-pulse">
                {data.unreadCount}
              </span>
            ) : null}
            <span className="text-[10px] font-bold">Chat</span>
          </Link>

          <Link
            href="/publier"
            className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full btn-pink text-white shadow-lg"
            aria-label="Publier"
          >
            <Plus size={24} />
          </Link>

          <Link
            href="/recherche"
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-slate-600"
          >
            <Search size={20} />
            <span className="text-[10px] font-bold">Recherche</span>
          </Link>

          <Link
            href="/compte"
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-slate-600"
          >
            <ShieldCheck size={20} />
            <span className="text-[10px] font-bold">Compte</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
