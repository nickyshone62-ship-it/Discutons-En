"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Impossible de vous connecter.");
        return;
      }

      window.location.href = "/accueil";
    } catch {
      setError("Impossible de contacter le serveur. Vérifie ta connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* GLASS CARD CONTAINER */}
      <div className="rounded-[32px] border border-white/30 bg-white/15 p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl text-white">
        <div className="mb-7 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-2xl font-black font-display tracking-tight hover:scale-105 transition duration-300"
          >
            <span className="text-cyan-400 text-shadow-glow">DIS</span>
            <span className="text-white">cutons-En</span>
          </Link>

          <h1 className="mt-6 text-3xl sm:text-4xl font-black font-display tracking-widest uppercase gradient-text-cyan text-shadow-glow">
            CONNEXION
          </h1>

          <p className="mt-2 text-xs font-semibold leading-relaxed text-cyan-100/90 max-w-xs mx-auto">
            Connecte-toi pour retrouver ton espace et la communauté.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-400/50 bg-red-500/25 px-4 py-3 text-xs font-bold text-red-100 text-center shadow-lg"
            >
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Adresse Email"
                className="h-12 w-full rounded-full bg-white px-6 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none shadow-inner focus:ring-4 focus:ring-cyan-300/80 focus:border-cyan-300 focus:scale-[1.01] transition-all duration-300"
              />
            </div>

            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mot de passe"
                className="h-12 w-full rounded-full bg-white px-6 pr-12 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none shadow-inner focus:ring-4 focus:ring-cyan-300/80 focus:border-cyan-300 focus:scale-[1.01] transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* LOGIN SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-sky-400 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 font-black font-display text-sm uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_40px_rgba(34,211,238,0.75)] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                CONNEXION EN COURS...
              </>
            ) : (
              <>
                SE CONNECTER
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-xs font-bold text-cyan-100">
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="font-black text-cyan-300 hover:text-white underline tracking-wider transition"
          >
            CRÉER UN COMPTE
          </Link>
        </p>
      </div>
    </div>
  );
}
