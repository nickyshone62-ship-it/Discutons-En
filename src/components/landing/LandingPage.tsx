"use client";

import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  Heart,
  ShieldCheck,
  Users,
  Lightbulb,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative min-h-screen flex items-center">

        {/* Décor */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-100/70 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-100/40 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-12">

          {/* Navigation */}
          <header className="mb-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="DIScutons-En"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
                <MessageCircle size={22} strokeWidth={2.5} />
              </div>

              <span className="text-xl font-extrabold tracking-tight">
                DIScutons<span className="text-blue-600">-En</span>
              </span>
            </Link>

            <Link
              href="/connexion"
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              Se connecter
            </Link>
          </header>

          {/* Hero content */}
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">

            <div className="max-w-2xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                <Sparkles size={16} />
                Une communauté qui s'entraide
              </div>

              <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Seul face au problème,
                <span className="mt-2 block text-blue-600">
                  ensemble pour la solution.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
                DIScutons-En est un espace où chacun peut partager
                ses problèmes, demander des conseils et aider les autres,
                dans une communauté bienveillante.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                <Link
                  href="/inscription"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-7 py-4 font-bold text-white shadow-xl shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-blue-600"
                >
                  Rejoindre DIScutons-En
                  <ArrowRight
                    size={19}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <a
                  href="#fonctionnement"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-4 font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Découvrir
                </a>

              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-500" />
                  Simple
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-500" />
                  Bienveillant
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-500" />
                  Anonyme
                </div>
              </div>

            </div>

            {/* Illustration */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">

              <div className="absolute inset-8 rounded-[3rem] bg-blue-100/70 blur-3xl" />

              <div className="relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70 sm:p-7">

                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      La communauté
                    </p>
                    <p className="text-xs text-slate-500">
                      Des personnes prêtes à aider
                    </p>
                  </div>

                  <div className="flex -space-x-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-200 text-xs font-bold">
                      A
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-violet-200 text-xs font-bold">
                      M
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-amber-200 text-xs font-bold">
                      K
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-emerald-200 text-xs font-bold">
                      +
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                      M
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        Membre-7K2P
                      </p>
                      <p className="text-xs text-slate-400">
                        Il y a quelques minutes
                      </p>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    Comment mieux organiser mes études ?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    J'ai du mal à gérer mon temps entre les cours,
                    les révisions et mes autres activités...
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      Études
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      12 réponses
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                      <Heart size={18} />
                    </div>
                    <p className="text-sm font-bold">
                      S'entraider
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Partager son expérience
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                      <Lightbulb size={18} />
                    </div>
                    <p className="text-sm font-bold">
                      Trouver des idées
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Des solutions concrètes
                    </p>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          VALEURS
      ====================================================== */}

      <section className="border-y border-slate-100 bg-slate-50/70 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Pourquoi DIScutons-En ?
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Un espace pensé pour les personnes
            </h2>

            <p className="mt-4 leading-7 text-slate-500">
              Parce qu'un problème partagé peut devenir une
              solution trouvée ensemble.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <MessageCircle size={23} />
              </div>

              <h3 className="mt-5 font-bold">
                Parler librement
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Expose ton problème et échange avec des personnes
                qui peuvent comprendre ta situation.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Users size={23} />
              </div>

              <h3 className="mt-5 font-bold">
                Une communauté
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Des membres peuvent partager leurs expériences,
                leurs conseils et leurs idées.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <ShieldCheck size={23} />
              </div>

              <h3 className="mt-5 font-bold">
                Préserver son anonymat
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Chaque membre dispose d'une identité anonyme
                pour participer plus sereinement.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Lightbulb size={23} />
              </div>

              <h3 className="mt-5 font-bold">
                Chercher des solutions
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Le but n'est pas seulement de parler, mais
                d'avancer ensemble vers une solution.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          FONCTIONNEMENT
      ====================================================== */}

      <section
        id="fonctionnement"
        className="bg-white py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Comment ça marche ?
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Quatre étapes pour avancer
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-4">

            <div className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
                01
              </div>

              <h3 className="mt-5 font-bold">
                Rejoins-nous
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Crée ton compte et rejoins la communauté.
              </p>
            </div>

            <div className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
                02
              </div>

              <h3 className="mt-5 font-bold">
                Partage ton problème
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Explique ta situation à la communauté.
              </p>
            </div>

            <div className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
                03
              </div>

              <h3 className="mt-5 font-bold">
                Reçois des réponses
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                D'autres membres partagent leurs conseils.
              </p>
            </div>

            <div className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">
                04
              </div>

              <h3 className="mt-5 font-bold">
                Avance ensemble
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Trouve des pistes et des solutions concrètes.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-slate-900 px-6 py-14 text-center text-white shadow-2xl sm:px-12 sm:py-20">

          <div className="mx-auto max-w-2xl">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <MessageCircle size={27} />
            </div>

            <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
              Tu n'es pas obligé de tout affronter seul.
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              Rejoins DIScutons-En et découvre une communauté
              prête à écouter, conseiller et aider.
            </p>

            <Link
              href="/inscription"
              className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 font-bold text-slate-900 transition hover:bg-blue-50"
            >
              Commencer maintenant
              <ArrowRight
                size={19}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <MessageCircle size={17} />
            </div>

            <span className="font-bold">
              DIScutons<span className="text-blue-600">-En</span>
            </span>
          </div>

          <p className="text-sm text-slate-400">
            Seul face au problème, ensemble pour la solution.
          </p>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} DIScutons-En
          </p>

        </div>
      </footer>

    </main>
  );
}
