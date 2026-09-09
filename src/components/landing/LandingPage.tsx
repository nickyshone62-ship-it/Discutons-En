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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#18030a] via-[#4c0519] to-[#881337] text-white font-sans">
      {/* GEOMETRIC BACKGROUND DECORATIONS MATCHING FIGMA DESIGN */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-rose-500/25 opacity-80 blur-3xl" />
      <div className="pointer-events-none absolute top-12 left-1/3 h-28 w-28 rounded-full bg-pink-400/20 blur-2xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-96 w-96 rounded-full bg-rose-600/30 opacity-80 blur-3xl" />
      <div className="pointer-events-none absolute bottom-32 right-1/4 h-32 w-32 rounded-full bg-rose-400/20 blur-2xl" />

      {/* DIAGONAL STRIPES */}
      <div className="pointer-events-none absolute top-10 right-12 h-3 w-48 rotate-[-35deg] rounded-full bg-white/40" />
      <div className="pointer-events-none absolute top-16 right-20 h-3 w-36 rotate-[-35deg] rounded-full bg-white/40" />
      <div className="pointer-events-none absolute bottom-16 left-10 h-3 w-52 rotate-[-35deg] rounded-full bg-white/40" />

      {/* NAVBAR */}
      <header className="relative z-20 border-b border-white/15 bg-slate-950/60 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo variant="horizontal" size="md" href="/" />

          <div className="flex items-center gap-3">
            <Link
              href="/connexion"
              className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white/20 font-display"
            >
              CONNEXION
            </Link>

            <Link
              href="/inscription"
              className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-black font-display px-6 py-2.5 text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(244,63,94,0.5)] transition transform active:scale-95"
            >
              S'INSCRIRE
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/20 px-4.5 py-1.5 text-xs font-bold text-rose-200 backdrop-blur-md shadow-lg">
            <ShieldCheck size={16} className="text-rose-400" />
            Plateforme d'Entraide 100% Anonyme & Bienveillante
          </div>

          <h1 className="text-4xl font-black font-display tracking-tight sm:text-6xl leading-tight uppercase text-white drop-shadow-xl">
            Un problème ? <br />
            <span className="gradient-text-rose text-shadow-glow">DIScutons-En</span> Ensemble
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-rose-100/90 max-w-2xl mx-auto font-semibold">
            Partage tes difficultés, pose tes questions et reçois les meilleurs conseils d'une communauté bienveillante sans jamais révéler ton identité réelle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/inscription"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-400 text-white font-black font-display text-sm uppercase tracking-widest py-4.5 px-9 shadow-[0_0_35px_rgba(244,63,94,0.6)] transition transform hover:scale-105 active:scale-95 duration-300"
            >
              REJOINDRE LA COMMUNAUTÉ
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/connexion"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-slate-950/40 hover:bg-white/15 text-white font-bold font-display text-sm py-4.5 px-8 backdrop-blur-md transition"
            >
              SE CONNECTER
            </Link>
          </div>
        </div>

        {/* FEATURES GRID MATCHING FIGMA CARDS */}
        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <div className="rounded-[28px] border border-rose-500/25 bg-slate-950/80 p-7 backdrop-blur-2xl shadow-2xl space-y-3 text-center sm:text-left hover:-translate-y-1 hover:border-rose-400/60 transition-all duration-300">
            <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-400/40 shadow-inner">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-base font-black font-display uppercase text-white tracking-wider">
              Anonymat Absolu
            </h3>
            <p className="text-xs text-rose-100/85 leading-relaxed font-medium">
              Un pseudonyme unique (Membre-XXXX) et un avatar dynamique vous sont attribués. Vos données réelles sont masquées.
            </p>
          </div>

          <div className="rounded-[28px] border border-rose-500/25 bg-slate-950/80 p-7 backdrop-blur-2xl shadow-2xl space-y-3 text-center sm:text-left hover:-translate-y-1 hover:border-rose-400/60 transition-all duration-300">
            <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-400/40 shadow-inner">
              <Sparkles size={24} />
            </div>
            <h3 className="text-base font-black font-display uppercase text-white tracking-wider">
              Meilleure Piste Guidée
            </h3>
            <p className="text-xs text-rose-100/85 leading-relaxed font-medium">
              La communauté vote pour mettre en valeur les réponses les plus utiles et vous aider à choisir la bonne voix.
            </p>
          </div>

          <div className="rounded-[28px] border border-rose-500/25 bg-slate-950/80 p-7 backdrop-blur-2xl shadow-2xl space-y-3 text-center sm:text-left hover:-translate-y-1 hover:border-rose-400/60 transition-all duration-300">
            <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-400/40 shadow-inner">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-base font-black font-display uppercase text-white tracking-wider">
              Salon Chat & Vocaux
            </h3>
            <p className="text-xs text-rose-100/85 leading-relaxed font-medium">
              Échangez en direct avec la communauté en texte ou via des messages vocaux instantanés.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
