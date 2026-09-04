import { Heart, MessageCircle, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-3xl text-center">

          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/10">
            <MessageCircle size={38} strokeWidth={1.7} />
          </div>

          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-slate-400">
            Une communauté pour s'entraider
          </p>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            DIS<span className="text-slate-400">cutons</span>-En
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-slate-300">
            Seul face au problème, ensemble pour la solution.
          </p>

          <div className="mx-auto mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <MessageCircle className="mx-auto mb-3" size={24} />
              <p className="text-sm text-slate-300">
                Partager
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Users className="mx-auto mb-3" size={24} />
              <p className="text-sm text-slate-300">
                Échanger
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Heart className="mx-auto mb-3" size={24} />
              <p className="text-sm text-slate-300">
                S'entraider
              </p>
            </div>

          </div>

          <p className="mt-12 text-sm text-slate-500">
            Projet en cours d'initialisation
          </p>

        </div>
      </section>
    </main>
  );
}
