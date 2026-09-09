import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export default function InscriptionPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#18030a] via-[#4c0519] to-[#881337] px-4 py-8 flex items-center justify-center">
      {/* BACKGROUND DECORATIVE GEOMETRIC ELEMENTS MATCHING FIGMA DESIGN */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-rose-500 opacity-30 blur-2xl" />
      <div className="pointer-events-none absolute top-12 left-1/4 h-12 w-12 rounded-full bg-pink-400 opacity-20 blur-sm" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-72 w-72 rounded-full bg-rose-600 opacity-35 blur-2xl" />
      <div className="pointer-events-none absolute bottom-24 right-1/3 h-16 w-16 rounded-full bg-rose-400 opacity-25" />
      <div className="pointer-events-none absolute top-1/3 right-12 h-32 w-32 rounded-full bg-rose-950/60" />
      <div className="pointer-events-none absolute top-10 left-10 h-32 w-32 rounded-full bg-rose-950/40" />

      {/* DIAGONAL STRIPES */}
      <div className="pointer-events-none absolute top-8 right-8 h-2.5 w-36 rotate-[-35deg] rounded-full bg-white/40" />
      <div className="pointer-events-none absolute top-14 right-12 h-2.5 w-28 rotate-[-35deg] rounded-full bg-white/40" />
      <div className="pointer-events-none absolute bottom-12 left-8 h-2.5 w-40 rotate-[-35deg] rounded-full bg-white/40" />
      <div className="pointer-events-none absolute bottom-18 left-14 h-2.5 w-32 rotate-[-35deg] rounded-full bg-white/40" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-4 text-left">
          <Link
            href="/"
            className="text-xs font-bold text-rose-200 transition hover:text-white"
          >
            ← Retour à l'accueil
          </Link>
        </div>

        <RegisterForm />
      </div>
    </main>
  );
}
