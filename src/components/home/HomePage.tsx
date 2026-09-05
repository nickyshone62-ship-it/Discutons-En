"use client";

import Link from "next/link";
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

type HomeData = {
  user: {
    id: string;
    username: string;
    email: string;
  };
  identity: {
    anonymousName: string;
    avatarUrl: string;
  };
  categories: Category[];
  posts: Post[];
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
    async function loadHome() {
      try {
        const response = await fetch("/api/home", {
          cache: "no-store",
        });

        const result = await response.json();

        if (response.status === 401) {
          window.location.href = "/connexion";
          return;
        }

        if (!response.ok || !result.success) {
          setError(
            result.message ||
              "Impossible de charger votre espace."
          );
          return;
        }

        setData(result);
      } catch {
        setError(
          "Impossible de contacter le serveur. Vérifie ta connexion."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHome();
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
      <main className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 p-6 text-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="h-16 animate-pulse rounded-3xl bg-white/10" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
            <div className="hidden h-96 animate-pulse rounded-3xl bg-white/10 lg:block" />
            <div className="space-y-4">
              <div className="h-40 animate-pulse rounded-3xl bg-white/10" />
              <div className="h-48 animate-pulse rounded-3xl bg-white/10" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-xl shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-red-300 font-bold text-xl">
            !
          </div>
          <h1 className="mt-5 text-xl font-black font-display tracking-wide text-white">
            Une erreur est survenue
          </h1>
          <p className="mt-2 text-xs font-semibold text-cyan-100/80">
            {error || "Impossible de charger votre espace."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-cyan-400 px-6 py-3 text-xs font-black font-display text-slate-950 uppercase tracking-widest shadow-lg shadow-cyan-400/40 hover:bg-cyan-300 transition"
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 text-white pb-24 overflow-x-hidden font-sans">
      {/* GEOMETRIC BACKGROUND DECORATIONS */}
      <div className="pointer-events-none fixed -top-20 -left-20 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 right-0 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 left-1/4 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-white/15 bg-slate-950/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/accueil"
            className="flex items-center gap-2 text-xl font-black font-display tracking-wider hover:scale-105 transition duration-300"
          >
            <span className="text-cyan-400 text-shadow-glow">DIS</span>
            <span className="text-white">cutons-En</span>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/chat"
              className="flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 px-4.5 text-xs font-black font-display uppercase tracking-wider transition shadow-lg shadow-cyan-400/35 transform active:scale-95"
            >
              <MessageSquare size={16} />
              Chat en direct
            </Link>

            <Link
              href="/recherche"
              className="flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-xs font-bold text-white transition hover:bg-white/20"
            >
              <Search size={16} />
              Rechercher
            </Link>

            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            </button>

            <div className="h-6 w-px bg-white/20 mx-1" />

            <Link
              href="/compte"
              className="flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 p-1 px-3.5 hover:bg-white/20 transition hover:scale-105 duration-300"
              title="Mon compte"
            >
              <img
                src={data.identity.avatarUrl}
                alt={data.identity.anonymousName}
                className="h-8 w-8 rounded-full border border-cyan-400/60"
              />
              <div className="hidden text-left lg:block">
                <p className="text-xs font-black text-white leading-tight font-display">
                  {data.identity.anonymousName}
                </p>
                <p className="text-[10px] text-cyan-300 font-bold">
                  Mon compte →
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-full p-2 text-slate-300 hover:bg-white/20 hover:text-red-400 transition"
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              <LogOut size={18} />
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur-2xl md:hidden">
            <Link
              href="/compte"
              onClick={() => setMenuOpen(false)}
              className="mb-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3"
            >
              <img
                src={data.identity.avatarUrl}
                alt={data.identity.anonymousName}
                className="h-11 w-11 rounded-full border border-cyan-400"
              />
              <div>
                <p className="text-sm font-bold text-white">
                  {data.identity.anonymousName}
                </p>
                <p className="text-xs text-cyan-300 font-bold">
                  Gérer mon compte →
                </p>
              </div>
            </Link>

            <div className="space-y-2">
              <Link
                href="/accueil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold text-white"
              >
                <Home size={18} />
                Accueil
              </Link>

              <Link
                href="/chat"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950 uppercase font-display"
              >
                <MessageSquare size={18} />
                Chat en direct
              </Link>

              <Link
                href="/recherche"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white"
              >
                <Search size={18} />
                Rechercher
              </Link>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl bg-red-500/20 px-4 py-3 text-left text-sm font-bold text-red-300"
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
              <div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-2xl shadow-xl space-y-2">
                <Link
                  href="/accueil"
                  className="flex items-center gap-3 rounded-2xl bg-cyan-400/20 border border-cyan-400/40 px-4 py-3 text-sm font-black font-display text-cyan-300"
                >
                  <Home size={18} />
                  Accueil
                </Link>

                <Link
                  href="/chat"
                  className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 px-4 py-3 text-sm font-black font-display text-slate-950 uppercase tracking-wider transition shadow-lg shadow-cyan-400/30 hover:scale-[1.02] duration-300"
                >
                  <MessageSquare size={18} />
                  Chat en direct
                </Link>

                <Link
                  href="/recherche"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10"
                >
                  <Search size={18} />
                  Rechercher
                </Link>
              </div>

              {/* CATEGORIES CARD */}
              <div className="rounded-3xl border border-white/20 bg-white/10 p-4.5 backdrop-blur-2xl shadow-xl">
                <h2 className="mb-3 text-xs font-black font-display uppercase tracking-widest text-cyan-300">
                  Catégories
                </h2>

                <div className="space-y-1">
                  {data.categories.map((category) => (
                    <button
                      key={category.id}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-slate-200 transition hover:bg-white/15 hover:text-white"
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
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-blue-900/90 p-6 text-white shadow-2xl backdrop-blur-2xl sm:p-8">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/30 blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <img
                    src={data.identity.avatarUrl}
                    alt={data.identity.anonymousName}
                    className="h-12 w-12 rounded-full border-2 border-cyan-400 shadow-lg"
                  />
                  <div>
                    <p className="text-xs font-semibold text-cyan-200">
                      Bienvenue
                    </p>
                    <p className="font-black font-display text-white text-base">
                      {data.identity.anonymousName}
                    </p>
                  </div>
                </div>

                <h1 className="mt-5 max-w-xl text-2xl font-black font-display tracking-tight sm:text-3xl gradient-text-cyan text-shadow-glow">
                  Quel problème veux-tu partager aujourd'hui ?
                </h1>

                <p className="mt-2.5 max-w-xl text-xs sm:text-sm leading-relaxed text-cyan-100/90 font-medium">
                  Exprime-toi librement. La communauté est là pour t'écouter, échanger et trouver la meilleure voie avec toi.
                </p>

                <Link
                  href="/publier"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-sky-400 hover:from-cyan-300 hover:to-cyan-200 px-7 py-3.5 text-xs font-black font-display uppercase tracking-widest text-slate-950 shadow-[0_0_25px_rgba(34,211,238,0.5)] transition transform hover:scale-[1.03] active:scale-95 duration-300"
                >
                  <Plus size={18} />
                  Partager un problème
                </Link>
              </div>
            </div>

            {/* MOBILE CATEGORIES */}
            <div className="lg:hidden">
              <h2 className="mb-2 text-xs font-black font-display uppercase tracking-widest text-cyan-300">
                Catégories
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {data.categories.map((category) => (
                  <button
                    key={category.id}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white"
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
                  <p className="text-xs font-black font-display uppercase tracking-widest text-cyan-400 text-shadow-glow">
                    Communauté
                  </p>
                  <h2 className="text-2xl font-black font-display text-white">
                    Problèmes récents
                  </h2>
                </div>

                <button className="flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-white transition">
                  Voir tout
                  <ChevronRight size={16} />
                </button>
              </div>

              {data.posts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-10 text-center backdrop-blur-2xl">
                  <MessageCircle size={36} className="mx-auto text-cyan-300 mb-3" />
                  <h3 className="font-black font-display text-white text-lg">
                    Aucun problème pour le moment
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-xs font-medium text-cyan-100/80">
                    Sois le premier à partager quelque chose avec la communauté.
                  </p>
                  <Link
                    href="/publier"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-xs font-black font-display uppercase text-slate-950 shadow-lg shadow-cyan-400/40"
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
                      className="rounded-3xl border border-white/20 bg-white/10 p-5 sm:p-6 shadow-xl backdrop-blur-2xl transition-all duration-300 hover:border-cyan-400/50 hover:bg-white/15 hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={post.author.avatarUrl}
                            alt={post.author.anonymousName}
                            className="h-10 w-10 shrink-0 rounded-full border border-cyan-400/40 shadow-sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-black font-display text-white">
                              {post.author.anonymousName}
                            </p>
                            <p className="text-[10px] font-semibold text-cyan-200/70">
                              {formatDate(post.createdAt)}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full bg-cyan-400/20 border border-cyan-400/40 px-3.5 py-1 text-xs font-extrabold text-cyan-300">
                          {getCategoryIcon(post.category.icon)}{" "}
                          {post.category.name}
                        </span>
                      </div>

                      <Link
                        href={`/probleme/${post.id}`}
                        className="mt-4 block group"
                      >
                        <h3 className="text-lg sm:text-xl font-black font-display leading-snug text-white transition group-hover:text-cyan-300">
                          {post.title}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-xs sm:text-sm leading-relaxed text-cyan-100/85 font-medium">
                          {post.content}
                        </p>
                      </Link>

                      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                        <div className="flex items-center gap-5 text-xs font-bold text-cyan-200/80">
                          <span className="flex items-center gap-1.5">
                            <MessageCircle size={16} className="text-cyan-400" />
                            {post.commentsCount}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Heart size={16} className="text-rose-400" />
                            {post.likesCount}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Eye size={16} className="text-cyan-300" />
                            {post.viewsCount}
                          </span>
                        </div>

                        <Link
                          href={`/probleme/${post.id}`}
                          className="text-xs font-black font-display text-cyan-300 hover:text-white transition"
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
              <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-2xl shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black font-display uppercase text-white">
                      Anonymat garanti
                    </h2>
                    <p className="text-[10px] font-bold text-cyan-300">Toujours protégé</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-cyan-100/80 font-medium">
                  Les autres membres voient uniquement ton pseudonyme anonyme attribué. Tes données personnelles sont privées.
                </p>
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-2xl shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    <Sparkles size={19} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black font-display uppercase text-white">
                      Bienveillance
                    </h2>
                    <p className="text-[10px] font-bold text-amber-300">Notre priorité</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-cyan-100/80 font-medium">
                  Échange avec respect et empathie. Chaque problème mérite d'être écouté sans jugement.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/15 bg-slate-950/95 px-4 py-2 backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <Link
            href="/accueil"
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-cyan-400"
          >
            <Home size={20} />
            <span className="text-[10px] font-bold">Accueil</span>
          </Link>

          <Link
            href="/chat"
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-slate-300 hover:text-cyan-300"
          >
            <MessageSquare size={20} />
            <span className="text-[10px] font-bold">Chat</span>
          </Link>

          <Link
            href="/publier"
            className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/50"
            aria-label="Publier"
          >
            <Plus size={24} />
          </Link>

          <Link
            href="/recherche"
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-slate-300"
          >
            <Search size={20} />
            <span className="text-[10px] font-bold">Recherche</span>
          </Link>

          <Link
            href="/compte"
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-slate-300"
          >
            <ShieldCheck size={20} />
            <span className="text-[10px] font-bold">Compte</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
