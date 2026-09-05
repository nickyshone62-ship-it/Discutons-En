"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Sparkles,
  Check,
  User,
  Ghost,
} from "lucide-react";
import { SNAPCHAT_AVATARS, getAvatarUrl, SnapchatAvatarPreset } from "@/lib/anonymous";


export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState(
    SNAPCHAT_AVATARS[0].seed
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const currentAvatarUrl = getAvatarUrl(selectedAvatarSeed, username || "avatar");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!firstName.trim() || firstName.trim().length < 2) {
      setError("Indique ton prénom (au moins 2 caractères).");
      return;
    }

    if (!lastName.trim() || lastName.trim().length < 2) {
      setError("Indique ton nom (au moins 2 caractères).");
      return;
    }

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
          firstName,
          lastName,
          email,
          username,
          password,
          avatarSeed: selectedAvatarSeed,
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
    <div className="relative w-full max-w-xl mx-auto my-6">
      {/* GLASS CARD CONTAINER */}
      <div className="rounded-[36px] border border-white/30 bg-white/15 p-6 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl text-white">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-2xl font-black font-display tracking-tight hover:scale-105 transition duration-300"
          >
            <span className="text-cyan-400 text-shadow-glow">DIS</span>
            <span className="text-white">cutons-En</span>
          </Link>

          <h1 className="mt-4 text-3xl sm:text-4xl font-black font-display tracking-widest uppercase gradient-text-cyan text-shadow-glow">
            INSCRIPTION
          </h1>

          <p className="mt-2 text-xs font-semibold leading-relaxed text-cyan-100/90 max-w-sm mx-auto">
            Crée ton compte privé avec ton nom & prénom et choisis ton Bitmoji Snapchat.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-400/50 bg-red-500/25 px-4 py-3 text-xs font-bold text-red-100 text-center shadow-lg"
            >
              {error}
            </div>
          )}

          {/* SNAPCHAT BITMOJI AVATAR PICKER */}
          <div className="rounded-3xl border border-white/20 bg-slate-950/60 p-5 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-slate-950 shadow-md font-bold">
                  👻
                </div>
                <div>
                  <h2 className="text-xs font-black font-display uppercase tracking-wider text-cyan-300">
                    Avatar Bitmoji (Style Snapchat)
                  </h2>
                  <p className="text-[10px] text-cyan-100/70">
                    Sélectionne ton avatar anonyme 3D
                  </p>
                </div>
              </div>

              <div className="relative">
                <img
                  src={currentAvatarUrl}
                  alt="Aperçu Bitmoji"
                  className="h-12 w-12 rounded-full border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] transition transform hover:scale-110"
                />
              </div>
            </div>

            {/* AVATARS GRID */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {SNAPCHAT_AVATARS.map((avatar: SnapchatAvatarPreset) => {

                const isSelected = selectedAvatarSeed === avatar.seed;
                const avatarUrl = getAvatarUrl(avatar.seed, avatar.name);

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatarSeed(avatar.seed)}
                    className={`group relative flex flex-col items-center justify-center rounded-2xl p-1.5 transition duration-300 transform active:scale-95 ${
                      isSelected
                        ? "border-2 border-cyan-400 bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.5)] scale-105"
                        : "border border-white/10 bg-white/5 hover:bg-white/15 hover:scale-100"
                    }`}
                  >
                    <div
                      className={`relative h-11 w-11 rounded-full p-0.5 bg-gradient-to-br ${avatar.bg} shadow-inner flex items-center justify-center`}
                    >
                      <img
                        src={avatarUrl}
                        alt={avatar.name}
                        className="h-10 w-10 rounded-full"
                      />

                      {isSelected && (
                        <div className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-md">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* NAME & SURNAME INPUTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-xs font-black uppercase text-cyan-300">
                Prénom
              </label>
              <input
                id="firstName"
                type="text"
                required
                minLength={2}
                maxLength={50}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Ex: Thomas"
                className="h-12 w-full rounded-full bg-white px-5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none shadow-inner focus:ring-4 focus:ring-cyan-300/80 focus:border-cyan-300 transition"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="mb-1.5 block text-xs font-black uppercase text-cyan-300">
                Nom
              </label>
              <input
                id="lastName"
                type="text"
                required
                minLength={2}
                maxLength={50}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Ex: Dubois"
                className="h-12 w-full rounded-full bg-white px-5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none shadow-inner focus:ring-4 focus:ring-cyan-300/80 focus:border-cyan-300 transition"
              />
            </div>
          </div>

          {/* USERNAME & EMAIL INPUTS */}
          <div className="space-y-3.5">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs font-black uppercase text-cyan-300">
                Nom d'utilisateur (Pseudo unique)
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                minLength={3}
                maxLength={50}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Ex: thomas_d"
                className="h-12 w-full rounded-full bg-white px-5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none shadow-inner focus:ring-4 focus:ring-cyan-300/80 focus:border-cyan-300 transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-black uppercase text-cyan-300">
                Adresse Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Ex: thomas.dubois@email.com"
                className="h-12 w-full rounded-full bg-white px-5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none shadow-inner focus:ring-4 focus:ring-cyan-300/80 focus:border-cyan-300 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="relative">
                <label htmlFor="password" className="mb-1.5 block text-xs font-black uppercase text-cyan-300">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="8+ caractères"
                  className="h-12 w-full rounded-full bg-white px-5 pr-12 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none shadow-inner focus:ring-4 focus:ring-cyan-300/80 focus:border-cyan-300 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-700 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-black uppercase text-cyan-300">
                  Confirmation
                </label>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Répéter le mot de passe"
                  className="h-12 w-full rounded-full bg-white px-5 pr-12 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none shadow-inner focus:ring-4 focus:ring-cyan-300/80 focus:border-cyan-300 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-700 transition"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* TERMS CHECKBOX */}
          <div className="flex items-center justify-center gap-2 pt-1">
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
            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-sky-400 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 font-black font-display text-sm uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_40px_rgba(34,211,238,0.75)] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                CREATION DU COMPTE...
              </>
            ) : (
              <>
                CREER MON COMPTE & BITMOJI
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-bold text-cyan-100">
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

