"use client";

import Link from "next/link";
import Logo from "@/components/brand/Logo";
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#fdf8fa] via-[#faedf3] to-[#f7e4ed] text-slate-900 font-sans">
      {/* GEOMETRIC BACKGROUND DECORATIONS MATCHING BECKY LIGHT UI */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-rose-200/50 opacity-80 blur-3xl" />
      <div className="pointer-events-none absolute top-12 left-1/3 h-28 w-28 rounded-full bg-pink-300/40 blur-2xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-96 w-96 rounded-full bg-rose-200/60 opacity-80 blur-3xl" />
      <div className="pointer-events-none absolute bottom-32 right-1/4 h-32 w-32 rounded-full bg-rose-300/30 blur-2xl" />

      {/* NAVBAR */}
      <header className="relative z-20 border-b border-pink-100/80 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo variant="horizontal" size="lg" href="/" />

          <div className="flex items-center gap-3">
            <Link
              href="/connexion"
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-50 font-display"
            >
              CONNEXION
            </Link>

            <Link
              href="/inscription"
              className="rounded-full btn-becky font-black font-display px-6 py-2.5 text-xs uppercase tracking-widest transition transform active:scale-95 shadow-[0_8px_20px_rgba(255,75,125,0.3)]"
            >
              S'INSCRIRE
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4.5 py-2 text-xs font-bold text-slate-800 shadow-md">
            <ShieldCheck size={16} className="text-[#ff2a6d]" />
            Plateforme d'Entraide 100% Anonyme & Bienveillante
          </div>

          <h1 className="text-4xl font-extrabold font-display tracking-tight sm:text-6xl leading-tight uppercase text-slate-900">
            Un problème ? <br />
            <span className="gradient-text-rose">DIScutons-En</span> Ensemble
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-slate-600 max-w-2xl mx-auto font-medium">
            Partage tes difficultés, pose tes questions et reçois les meilleurs conseils d'une communauté bienveillante sans jamais révéler ton identité réelle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/inscription"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl btn-becky font-extrabold font-display text-sm uppercase tracking-widest py-4.5 px-9 shadow-[0_12px_30px_rgba(255,75,125,0.35)] transition transform hover:scale-105 active:scale-95 duration-300"
            >
              REJOINDRE LA COMMUNAUTÉ
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/connexion"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold font-display text-sm py-4.5 px-8 shadow-sm transition"
            >
              SE CONNECTER
            </Link>
          </div>
        </div>

        {/* FEATURES GRID MATCHING BECKY LIGHT CARDS */}
        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <div className="rounded-[28px] border border-pink-100/80 bg-white p-7 shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-3 text-center sm:text-left hover:-translate-y-1 hover:border-[#ff2a6d]/40 transition-all duration-300">
            <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-[#ff2a6d] border border-rose-100 shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-base font-extrabold font-display uppercase text-slate-900 tracking-wider">
              Anonymat Absolu
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Un pseudonyme unique (Membre-XXXX) et un avatar dynamique vous sont attribués. Vos données réelles sont masquées.
            </p>
          </div>

          <div className="rounded-[28px] border border-pink-100/80 bg-white p-7 shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-3 text-center sm:text-left hover:-translate-y-1 hover:border-[#ff2a6d]/40 transition-all duration-300">
            <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-[#ff2a6d] border border-rose-100 shadow-sm">
              <Sparkles size={24} />
            </div>
            <h3 className="text-base font-extrabold font-display uppercase text-slate-900 tracking-wider">
              Meilleure Piste Guidée
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              La communauté vote pour mettre en valeur les réponses les plus utiles et vous aider à choisir la bonne voix.
            </p>
          </div>

          <div className="rounded-[28px] border border-pink-100/80 bg-white p-7 shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-3 text-center sm:text-left hover:-translate-y-1 hover:border-[#ff2a6d]/40 transition-all duration-300">
            <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-[#ff2a6d] border border-rose-100 shadow-sm">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-base font-extrabold font-display uppercase text-slate-900 tracking-wider">
              Salon Chat & Vocaux
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Échangez en direct avec la communauté en texte ou via des messages vocaux instantanés.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
