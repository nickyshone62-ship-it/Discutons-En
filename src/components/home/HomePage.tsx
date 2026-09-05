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
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="h-16 animate-pulse rounded-2xl bg-white" />

          <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
            <div className="hidden h-96 animate-pulse rounded-3xl bg-white lg:block" />

            <div className="space-y-4">
              <div className="h-40 animate-pulse rounded-3xl bg-white" />
              <div className="h-48 animate-pulse rounded-3xl bg-white" />
              <div className="h-48 animate-pulse rounded-3xl bg-white" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-950">
            Une erreur est survenue
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "Impossible de charger votre espace."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/accueil"
            className="flex items-center gap-2 text-xl font-black tracking-tight"
          >
            <span className="text-sky-500">DIS</span>
            <span>cutons-En</span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/recherche"
              className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Search size={18} />
              Rechercher
            </Link>

            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-sky-500" />
            </button>

            <div className="ml-2 h-8 w-px bg-slate-200" />

            <div className="ml-2 flex items-center gap-3">
              <img
                src={data.identity.avatarUrl}
                alt={data.identity.anonymousName}
                className="h-9 w-9 rounded-full"
              />

              <div className="hidden text-left lg:block">
                <p className="text-xs font-bold text-slate-900">
                  {data.identity.anonymousName}
                </p>
                <p className="text-[11px] text-slate-400">
                  Identité anonyme
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="ml-1 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-500"
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <img
                src={data.identity.avatarUrl}
                alt={data.identity.anonymousName}
                className="h-11 w-11 rounded-full"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {data.identity.anonymousName}
                </p>
                <p className="text-xs text-slate-400">
                  Identité anonyme
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Link
                href="/accueil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700"
              >
                <Home size={18} />
                Accueil
              </Link>

              <Link
                href="/recherche"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700"
              >
                <Search size={18} />
                Rechercher
              </Link>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-500"
              >
                <LogOut size={18} />
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)_260px]">
          {/* SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <Link
                  href="/accueil"
                  className="flex items-center gap-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700"
                >
                  <Home size={18} />
                  Accueil
                </Link>

                <Link
                  href="/recherche"
                  className="mt-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Search size={18} />
                  Rechercher
                </Link>

                <button className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                  <Bell size={18} />
                  Notifications
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">
                    Catégories
                  </h2>
                </div>

                <div className="space-y-1">
                  {data.categories.map((category) => (
                    <button
                      key={category.id}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      <span className="text-base">
                        {getCategoryIcon(category.icon)}
                      </span>
                      <span className="truncate">
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <section className="min-w-0">
            {/* WELCOME */}
            <div className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-lg sm:p-8">
              <div className="relative">
                <div className="absolute -right-20 -top-24 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-3">
                    <img
                      src={data.identity.avatarUrl}
                      alt={data.identity.anonymousName}
                      className="h-12 w-12 rounded-full border-2 border-white/20"
                    />

                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Bienvenue
                      </p>
                      <p className="font-bold">
                        {data.identity.anonymousName}
                      </p>
                    </div>
                  </div>

                  <h1 className="mt-6 max-w-xl text-2xl font-black tracking-tight sm:text-3xl">
                    Quel problème veux-tu partager aujourd'hui ?
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                    Parle librement. La communauté est là pour
                    t'écouter, échanger et chercher des solutions
                    avec toi.
                  </p>

                  <Link
                    href="/publier"
                    className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-50"
                  >
                    <Plus size={18} />
                    Partager un problème
                  </Link>
                </div>
              </div>
            </div>

            {/* MOBILE CATEGORIES */}
            <div className="mt-6 lg:hidden">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Catégories
                </h2>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {data.categories.map((category) => (
                  <button
                    key={category.id}
                    className="flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600"
                  >
                    <span>{getCategoryIcon(category.icon)}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* POSTS */}
            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-sky-500">
                    Communauté
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Problèmes récents
                  </h2>
                </div>

                <button className="flex items-center gap-1 text-sm font-semibold text-sky-600">
                  Voir tout
                  <ChevronRight size={16} />
                </button>
              </div>

              {data.posts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
                    <MessageCircle size={24} />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">
                    Aucun problème pour le moment
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Sois le premier à partager quelque chose avec
                    la communauté.
                  </p>

                  <Link
                    href="/publier"
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
                  >
                    <Plus size={17} />
                    Publier un problème
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.posts.map((post) => (
                    <article
                      key={post.id}
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={post.author.avatarUrl}
                            alt={post.author.anonymousName}
                            className="h-10 w-10 shrink-0 rounded-full"
                          />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {post.author.anonymousName}
                            </p>

                            <p className="text-xs text-slate-400">
                              {formatDate(post.createdAt)}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-xl bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">
                          {getCategoryIcon(post.category.icon)}{" "}
                          {post.category.name}
                        </span>
                      </div>

                      <Link
                        href={`/probleme/${post.id}`}
                        className="mt-4 block"
                      >
                        <h3 className="text-lg font-black leading-7 text-slate-950 transition hover:text-sky-600">
                          {post.title}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                          {post.content}
                        </p>
                      </Link>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <MessageCircle size={15} />
                            {post.commentsCount}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Heart size={15} />
                            {post.likesCount}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Eye size={15} />
                            {post.viewsCount}
                          </span>
                        </div>

                        <Link
                          href={`/probleme/${post.id}`}
                          className="text-xs font-bold text-sky-600 hover:text-sky-700"
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
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    <ShieldCheck size={21} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Ton anonymat
                    </h2>
                    <p className="text-xs text-slate-400">
                      Toujours protégé
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Les autres membres voient uniquement ton identité
                  anonyme. Ton email et ton compte restent privés.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                    <Sparkles size={20} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Bienveillance
                    </h2>
                    <p className="text-xs text-slate-400">
                      Notre priorité
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Échange avec respect. Chaque problème mérite
                  d'être écouté sans jugement.
                </p>
              </div>

              <div className="rounded-3xl bg-sky-500 p-5 text-white">
                <Plus size={20} />

                <h2 className="mt-4 text-lg font-black">
                  Un problème ?
                </h2>

                <p className="mt-1 text-xs leading-5 text-sky-100">
                  Partage-le avec la communauté et cherchons
                  ensemble une solution.
                </p>

                <Link
                  href="/publier"
                  className="mt-4 inline-flex rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-sky-600"
                >
                  Publier maintenant
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <Link
            href="/accueil"
            className="flex flex-col items-center gap-1 px-4 py-1.5 text-sky-600"
          >
            <Home size={20} />
            <span className="text-[10px] font-bold">Accueil</span>
          </Link>

          <Link
            href="/recherche"
            className="flex flex-col items-center gap-1 px-4 py-1.5 text-slate-400"
          >
            <Search size={20} />
            <span className="text-[10px] font-bold">Recherche</span>
          </Link>

          <Link
            href="/publier"
            className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg"
            aria-label="Publier"
          >
            <Plus size={23} />
          </Link>

          <button
            className="flex flex-col items-center gap-1 px-4 py-1.5 text-slate-400"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="text-[10px] font-bold">Alertes</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-4 py-1.5 text-slate-400"
            aria-label="Se déconnecter"
          >
            <LogOut size={20} />
            <span className="text-[10px] font-bold">Sortir</span>
          </button>
        </div>
      </nav>
    </main>
  );
}
