"use client";

import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";

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
      <div className="rounded-[36px] border border-pink-100/80 bg-white p-8 sm:p-10 shadow-[0_25px_65px_rgba(0,0,0,0.06)] text-slate-900">
        <div className="mb-8 text-center space-y-3">
          <Logo variant="full" size="lg" href="/" className="mb-3" />

          <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-[#ff2a6d] shadow-sm">
            <Sparkles size={13} className="text-[#ff2a6d]" />
            Espace Membre Anonyme
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-slate-900">
            Se Connecter
          </h1>

          <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-600 max-w-xs mx-auto">
            Connecte-toi pour retrouver ton <span className="text-[#ff2a6d] font-extrabold">espace anonyme</span> et échanger en toute sécurité.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              <label htmlFor="login-email" className="mb-1.5 flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-800">
                <span>Adresse email</span>
                <span className="text-[10px] font-bold text-[#ff2a6d]">Requis</span>
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Ex: votre_email@domaine.com"
                className="h-13 w-full rounded-2xl bg-[#f4f3f6] px-5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#ff2a6d] focus:border-transparent transition-all duration-200 shadow-inner"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-800">
                <span>Mot de passe</span>
                <span className="text-[10px] font-bold text-[#ff2a6d]">Requis</span>
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
                  className="h-13 w-full rounded-2xl bg-[#f4f3f6] px-5 pr-12 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#ff2a6d] focus:border-transparent transition-all duration-200 shadow-inner"
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

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl btn-pink font-extrabold font-display text-sm uppercase tracking-wider transition-all duration-300 transform active:scale-95 disabled:opacity-60 shadow-lg"
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

        <div className="mt-8 pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-600">
            Pas encore de compte ?{" "}
            <Link
              href="/inscription"
              className="font-black text-[#ff2a6d] hover:underline transition"
            >
              Créer un compte
            </Link>
          </p>

          <p className="text-[11px] text-slate-500 pt-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#ff2a6d] bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-1.5 rounded-full transition"
            >
              <ShieldCheck size={14} className="text-[#ff2a6d]" />
              Espace Administrateur 🛡️
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
