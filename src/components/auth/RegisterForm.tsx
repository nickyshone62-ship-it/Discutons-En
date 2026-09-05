"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!termsAccepted) {
      setError("Tu dois accepter les conditions d'utilisation.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Impossible de créer le compte.");
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
            INSCRIPTION
          </h1>

          <p className="mt-2 text-xs font-semibold leading-relaxed text-cyan-100/90 max-w-xs mx-auto">
            Rejoins une communauté bienveillante d'entraide 100% anonyme.
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
                id="username"
                type="text"
                autoComplete="username"
                required
                minLength={3}
                maxLength={50}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Nom d'utilisateur"
                className="h-12 w-full rounded-full bg-white px-6 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none shadow-inner focus:ring-4 focus:ring-cyan-300/80 focus:border-cyan-300 focus:scale-[1.01] transition-all duration-300"
              />
            </div>

            <div>
              <input
                id="email"
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
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mot de passe (8+ car.)"
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

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirmer le mot de passe"
                className="h-12 w-full rounded-full bg-white px-6 pr-12 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none shadow-inner focus:ring-4 focus:ring-cyan-300/80 focus:border-cyan-300 focus:scale-[1.01] transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* TERMS CHECKBOX */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-cyan-100 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 rounded accent-cyan-400 cursor-pointer"
              />
              <span>
                J'accepte les{" "}
                <span className="text-cyan-300 font-bold underline hover:text-white transition">
                  Conditions d'Utilisation
                </span>
              </span>
            </label>
          </div>

          {/* REGISTER SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-sky-400 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 font-black font-display text-sm uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_40px_rgba(34,211,238,0.75)] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                INSCRIPTION EN COURS...
              </>
            ) : (
              <>
                S'INSCRIRE MAINTENANT
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-xs font-bold text-cyan-100">
          Tu as déjà un compte ?{" "}
          <Link
            href="/connexion"
            className="font-black text-cyan-300 hover:text-white underline tracking-wider transition"
          >
            SE CONNECTER
          </Link>
        </p>
      </div>
    </div>
  );
}
