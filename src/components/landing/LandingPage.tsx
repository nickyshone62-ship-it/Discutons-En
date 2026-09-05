"use client";

import Link from "next/link";
import {
  ArrowRight,
  Heart,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 text-white font-sans">
      {/* GEOMETRIC BACKGROUND DECORATIONS MATCHING MOCKUP */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-400 opacity-80 blur-3xl" />
      <div className="pointer-events-none absolute top-12 left-1/3 h-16 w-16 rounded-full bg-cyan-300 opacity-70" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-96 w-96 rounded-full bg-cyan-400 opacity-80 blur-3xl" />
      <div className="pointer-events-none absolute bottom-32 right-1/4 h-20 w-20 rounded-full bg-cyan-300 opacity-75" />

      {/* DIAGONAL STRIPES */}
      <div className="pointer-events-none absolute top-10 right-12 h-3 w-48 rotate-[-35deg] rounded-full bg-white/60" />
      <div className="pointer-events-none absolute top-16 right-20 h-3 w-36 rotate-[-35deg] rounded-full bg-white/60" />
      <div className="pointer-events-none absolute bottom-16 left-10 h-3 w-52 rotate-[-35deg] rounded-full bg-white/60" />

      {/* NAVBAR */}
      <header className="relative z-20 border-b border-white/15 bg-slate-950/50 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-black font-display tracking-wider hover:scale-105 transition duration-300"
          >
            <span className="text-cyan-400 text-shadow-glow">DIS</span>
            <span className="text-white">cutons-En</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/connexion"
              className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white/20 font-display"
            >
              CONNEXION
            </Link>

            <Link
              href="/inscription"
              className="rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-black font-display px-6 py-2.5 text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] transition transform active:scale-95"
            >
              S'INSCRIRE
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1.5 text-xs font-bold text-cyan-300 backdrop-blur-md">
            <ShieldCheck size={16} />
            Plateforme d'Entraide 100% Anonyme & Bienveillante
          </div>

          <h1 className="text-4xl font-black font-display tracking-tight sm:text-6xl leading-tight uppercase text-white drop-shadow-lg">
            Un problème ? <br />
            <span className="gradient-text-cyan text-shadow-glow">DIScutons-En</span> Ensemble
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-cyan-100/90 max-w-2xl mx-auto font-semibold">
            Partage tes difficultés, pose tes questions et reçois les meilleurs conseils d'une communauté bienveillante sans jamais révéler ton identité réelle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/inscription"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-sky-400 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 font-black font-display text-sm uppercase tracking-widest py-4.5 px-9 shadow-[0_0_30px_rgba(34,211,238,0.5)] transition transform hover:scale-105 active:scale-95 duration-300"
            >
              REJOINDRE LA COMMUNAUTÉ
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/connexion"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold font-display text-sm py-4.5 px-8 backdrop-blur-md transition"
            >
              SE CONNECTER
            </Link>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-7 backdrop-blur-2xl shadow-2xl space-y-3 text-center sm:text-left hover:-translate-y-1 transition-all duration-300">
            <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-base font-black font-display uppercase text-white tracking-wider">
              Anonymat Absolu
            </h3>
            <p className="text-xs text-cyan-100/80 leading-relaxed font-medium">
              Un pseudonyme unique (Membre-XXXX) et un avatar dynamique vous sont attribués. Vos données réelles sont masquées.
            </p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-7 backdrop-blur-2xl shadow-2xl space-y-3 text-center sm:text-left hover:-translate-y-1 transition-all duration-300">
            <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40">
              <Sparkles size={24} />
            </div>
            <h3 className="text-base font-black font-display uppercase text-white tracking-wider">
              Meilleure Piste Guidée
            </h3>
            <p className="text-xs text-cyan-100/80 leading-relaxed font-medium">
              La communauté vote pour mettre en valeur les réponses les plus utiles et vous aider à choisir la bonne voix.
            </p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-7 backdrop-blur-2xl shadow-2xl space-y-3 text-center sm:text-left hover:-translate-y-1 transition-all duration-300">
            <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-400/20 text-purple-300 border border-purple-400/40">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-base font-black font-display uppercase text-white tracking-wider">
              Salon Chat & Vocaux
            </h3>
            <p className="text-xs text-cyan-100/80 leading-relaxed font-medium">
              Échangez en direct avec la communauté en texte ou via des messages vocaux instantanés.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
