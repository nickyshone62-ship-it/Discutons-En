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
      <div className="rounded-3xl border border-white/20 bg-white/15 p-7 sm:p-9 shadow-2xl backdrop-blur-xl text-white">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-2xl font-black tracking-tight"
          >
            <span className="text-cyan-400">DIS</span>
            <span>cutons-En</span>
          </Link>

          <h1 className="mt-6 text-3xl font-black tracking-widest text-white uppercase drop-shadow-md">
            CONNEXION
          </h1>

          <p className="mt-2 text-xs font-medium leading-relaxed text-cyan-100/80">
            Connecte-toi pour retrouver ton espace et la communauté.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-400/40 bg-red-500/20 px-4 py-2.5 text-xs font-bold text-red-200 text-center"
            >
              {error}
            </div>
          )}

          <div>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Adresse Email"
              className="h-12 w-full rounded-full bg-white px-5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition shadow-inner focus:ring-4 focus:ring-cyan-300"
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
              className="h-12 w-full rounded-full bg-white px-5 pr-12 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition shadow-inner focus:ring-4 focus:ring-cyan-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* LOGIN SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm uppercase tracking-wider transition transform active:scale-95 shadow-lg shadow-cyan-400/40 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                CONNEXION EN COURS...
              </>
            ) : (
              <>
                SE CONNECTER
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-cyan-100/90">
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="font-extrabold text-cyan-300 hover:text-white underline tracking-wide"
          >
            CRÉER UN COMPTE
          </Link>
        </p>
      </div>
    </div>
  );
}
