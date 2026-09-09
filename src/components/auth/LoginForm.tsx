"use client";

import Link from "next/link";
import Logo from "@/components/brand/Logo";
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
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
      setError("Impossible de contacter le serveur. Vérifie ta connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* BECKY UI LIGHT CARD CONTAINER */}
      <div className="rounded-[36px] border border-pink-100/70 bg-white p-8 sm:p-10 shadow-[0_25px_65px_rgba(0,0,0,0.06)] text-slate-900">
        <div className="mb-7 text-center">
          <Logo variant="full" size="lg" href="/" className="mb-2" />

          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-slate-900">
            Se connecter
          </h1>

          <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500 max-w-xs mx-auto">
            Connecte-toi pour retrouver ton espace et la communauté.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 text-center shadow-sm"
            >
              {error}
            </div>
          )}

          <div className="space-y-4 text-left">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold text-slate-700">
                Adresse email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Entrez votre adresse email"
                className="h-13 w-full rounded-2xl bg-[#f4f3f6] px-5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#ff2a6d] focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-bold text-slate-700">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="h-13 w-full rounded-2xl bg-[#f4f3f6] px-5 pr-12 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#ff2a6d] focus:border-transparent transition-all duration-200"
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
          </div>

          {/* BECKY EXACT GRADIENT BUTTON (ROSE TO ORANGE) */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl btn-becky font-extrabold font-display text-sm uppercase tracking-wider transition-all duration-300 transform active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin text-white" />
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

        <p className="mt-8 text-center text-xs font-medium text-slate-600">
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="font-bold text-slate-900 hover:text-[#ff2a6d] transition"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
