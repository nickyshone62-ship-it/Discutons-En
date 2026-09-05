"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";

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
            INSCRIPTION
          </h1>

          <p className="mt-2 text-xs font-medium leading-relaxed text-cyan-100/80">
            Rejoins une communauté bienveillante d'entraide anonyme.
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
              id="username"
              type="text"
              autoComplete="username"
              required
              minLength={3}
              maxLength={50}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Nom d'utilisateur"
              className="h-12 w-full rounded-full bg-white px-5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition shadow-inner focus:ring-4 focus:ring-cyan-300"
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
              className="h-12 w-full rounded-full bg-white px-5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition shadow-inner focus:ring-4 focus:ring-cyan-300"
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

          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirmer le mot de passe"
              className="h-12 w-full rounded-full bg-white px-5 pr-12 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition shadow-inner focus:ring-4 focus:ring-cyan-300"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* TERMS CHECKBOX */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-cyan-100 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 rounded accent-cyan-400 cursor-pointer"
              />
              <span>J'accepte les <span className="text-cyan-300 font-bold underline">Conditions d'Utilisation</span></span>
            </label>
          </div>

          {/* REGISTER SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm uppercase tracking-wider transition transform active:scale-95 shadow-lg shadow-cyan-400/40 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                INSCRIPTION EN COURS...
              </>
            ) : (
              <>
                S'INSCRIRE MAINTENANT
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-cyan-100/90">
          Tu as déjà un compte ?{" "}
          <Link
            href="/connexion"
            className="font-extrabold text-cyan-300 hover:text-white underline tracking-wide"
          >
            SE CONNECTER
          </Link>
        </p>
      </div>
    </div>
  );
}
