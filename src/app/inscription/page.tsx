import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export default function InscriptionPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#fdf8fa] via-[#faedf3] to-[#f7e4ed] text-slate-900 px-4 py-8 flex items-center justify-center font-sans">
      {/* GEOMETRIC BACKGROUND DECORATIONS MATCHING LANDING PAGE */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-rose-200/50 opacity-80 blur-3xl" />
      <div className="pointer-events-none absolute top-12 left-1/3 h-28 w-28 rounded-full bg-pink-300/40 blur-2xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-96 w-96 rounded-full bg-rose-200/60 opacity-80 blur-3xl" />
      <div className="pointer-events-none absolute bottom-32 right-1/4 h-32 w-32 rounded-full bg-rose-300/30 blur-2xl" />

      <div className="relative z-10 w-full max-w-xl">
        <div className="mb-4 text-left">
          <Link
            href="/"
            className="text-xs font-bold text-slate-600 transition hover:text-[#ff2a6d]"
          >
            ← Retour à l'accueil
          </Link>
        </div>

        <RegisterForm />
      </div>
    </main>
  );
}
