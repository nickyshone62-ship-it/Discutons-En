import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export default function InscriptionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            ← Retour à l'accueil
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
