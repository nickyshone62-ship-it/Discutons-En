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
  PhoneCall,
  ExternalLink,
  CreditCard,
  Clock,
} from "lucide-react";
import { SNAPCHAT_AVATARS, getAvatarUrl, SnapchatAvatarPreset } from "@/lib/anonymous";
import { OrangeMoneyLogo, MoovMoneyLogo, WaveLogo } from "@/components/auth/PaymentLogos";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"ORANGE_MONEY" | "MOOV_MONEY" | "WAVE">("ORANGE_MONEY");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState(
    SNAPCHAT_AVATARS[0].seed
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingSuccess, setPendingSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const filteredAvatars =
    activeCategory === "ALL"
      ? SNAPCHAT_AVATARS
      : SNAPCHAT_AVATARS.filter((a) => a.category === activeCategory);

  function handleRandomize() {
    const randomIndex = Math.floor(Math.random() * SNAPCHAT_AVATARS.length);
    setSelectedAvatarSeed(SNAPCHAT_AVATARS[randomIndex].seed);
  }

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

    if (!paymentPhone.trim() || paymentPhone.trim().length < 8) {
      setError("Indique le numéro de téléphone valide utilisé pour effectuer le paiement.");
      return;
    }

    if (!paymentRef.trim() || paymentRef.trim().length < 3) {
      setError("Indique l'ID de transaction ou la référence de ton paiement.");
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
          paymentMethod,
          paymentPhone,
          paymentRef,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Impossible de créer le compte.");
        return;
      }

      if (data.requiresApproval) {
        setPendingSuccess(true);
        setSuccessMessage(data.message);
      } else {
        window.location.href = "/accueil";
      }
    } catch {
      setError("Impossible de contacter le serveur. Vérifie ta connexion.");
    } finally {
      setLoading(false);
    }
  }

  if (pendingSuccess) {
    return (
      <div className="relative w-full max-w-lg mx-auto my-10">
        <div className="rounded-[36px] border border-cyan-400/30 bg-slate-950/80 p-8 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.7)] backdrop-blur-2xl text-white text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 border-2 border-amber-400/80 text-amber-300 animate-pulse">
            <Clock size={40} />
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-full bg-amber-400/20 px-3 py-1 text-xs font-black text-amber-300 uppercase tracking-widest border border-amber-400/30">
              En attente d'approbation
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-wide">
              Compte Créé avec Succès !
            </h2>
          </div>

          <p className="text-sm text-cyan-100/90 leading-relaxed font-medium">
            {successMessage || "Votre compte a été enregistré. Un administrateur va vérifier votre paiement et activer votre compte sous peu."}
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center text-cyan-200">
              <span className="font-semibold text-cyan-100/70">Moyen de paiement :</span>
              <span className="font-black text-white flex items-center gap-1.5">
                {paymentMethod === "ORANGE_MONEY" && <><OrangeMoneyLogo className="h-5 w-5" /> Orange Money</>}
                {paymentMethod === "MOOV_MONEY" && <><MoovMoneyLogo className="h-5 w-5" /> Moov Money</>}
                {paymentMethod === "WAVE" && <><WaveLogo className="h-5 w-5" /> Wave</>}
              </span>
            </div>
            <div className="flex justify-between items-center text-cyan-200">
              <span className="font-semibold text-cyan-100/70">Numéro de paiement :</span>
              <span className="font-mono font-bold text-cyan-300">{paymentPhone}</span>
            </div>
            <div className="flex justify-between items-center text-cyan-200">
              <span className="font-semibold text-cyan-100/70">Référence transaction :</span>
              <span className="font-mono font-bold text-amber-300">{paymentRef}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/connexion"
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg px-6"
            >
              Aller à la Connexion
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
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
            Crée ton compte privé avec ton nom & prénom et choisis parmi <strong>100 Avatars Bitmoji</strong>.
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
                  <h2 className="text-xs font-black font-display uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                    100 Avatars Bitmoji Snapchat
                    <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] text-cyan-300 font-bold border border-cyan-400/30">
                      100 au choix
                    </span>
                  </h2>
                  <p className="text-[10px] text-cyan-100/70">
                    Clique pour choisir ou mélange au hasard 🔀
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRandomize}
                  className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-[11px] font-bold text-cyan-300 hover:text-white transition flex items-center gap-1"
                  title="Choisir un avatar au hasard"
                >
                  🔀 Aleatoire
                </button>

                <img
                  src={currentAvatarUrl}
                  alt="Aperçu Bitmoji"
                  className="h-12 w-12 rounded-full border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] transition transform hover:scale-110"
                />
              </div>
            </div>

            {/* CATEGORY FILTER TABS */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: "ALL", label: "⭐ Tous (100)" },
                { id: "Réaliste 3D", label: "👤 Réaliste 3D" },
                { id: "Portraits", label: "🖼️ Portraits" },
                { id: "Classique", label: "✨ Classique" },
                { id: "Moderne", label: "🎨 Moderne" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                    activeCategory === tab.id
                      ? "bg-cyan-400 text-slate-950 font-black shadow-md"
                      : "bg-white/10 text-cyan-200/80 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* AVATARS GRID */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredAvatars.map((avatar: SnapchatAvatarPreset) => {
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

          {/* MOYEN DE PAIEMENT SECTION */}
          <div className="rounded-3xl border border-cyan-400/30 bg-slate-950/70 p-5 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 font-black shadow-md">
                <CreditCard size={20} />
              </div>
              <div>
                <h2 className="text-xs font-black font-display uppercase tracking-wider text-cyan-300">
                  Moyen de Paiement à l'inscription
                </h2>
                <p className="text-[10px] text-cyan-100/70">
                  Sélectionne ton moyen de paiement et effectue le transfert vers le numéro <strong>06887330</strong>.
                </p>
              </div>
            </div>

            {/* PAYMENT LOGO SELECTOR TABS */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("ORANGE_MONEY")}
                className={`flex flex-col items-center justify-center rounded-2xl p-3 border transition duration-300 ${
                  paymentMethod === "ORANGE_MONEY"
                    ? "border-orange-500 bg-orange-500/20 shadow-[0_0_20px_rgba(255,121,0,0.4)] scale-102"
                    : "border-white/10 bg-white/5 hover:bg-white/15"
                }`}
              >
                <OrangeMoneyLogo className="h-9 w-9 mb-1" />
                <span className="text-[11px] font-black text-orange-300">Orange Money</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("MOOV_MONEY")}
                className={`flex flex-col items-center justify-center rounded-2xl p-3 border transition duration-300 ${
                  paymentMethod === "MOOV_MONEY"
                    ? "border-emerald-500 bg-emerald-500/20 shadow-[0_0_20px_rgba(0,168,89,0.4)] scale-102"
                    : "border-white/10 bg-white/5 hover:bg-white/15"
                }`}
              >
                <MoovMoneyLogo className="h-9 w-9 mb-1" />
                <span className="text-[11px] font-black text-emerald-300">Moov Money</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("WAVE")}
                className={`flex flex-col items-center justify-center rounded-2xl p-3 border transition duration-300 ${
                  paymentMethod === "WAVE"
                    ? "border-sky-400 bg-sky-400/20 shadow-[0_0_20px_rgba(29,195,244,0.4)] scale-102"
                    : "border-white/10 bg-white/5 hover:bg-white/15"
                }`}
              >
                <WaveLogo className="h-9 w-9 mb-1" />
                <span className="text-[11px] font-black text-sky-300">Wave</span>
              </button>
            </div>

            {/* PAYMENT METHOD DETAILS & DIRECT ACTION BUTTONS */}
            {paymentMethod === "ORANGE_MONEY" && (
              <div className="rounded-2xl border border-orange-500/40 bg-orange-950/30 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-orange-200">Code USSD Orange Money :</span>
                  <span className="font-mono font-black text-amber-300 bg-black/40 px-2 py-1 rounded-lg border border-orange-500/30 select-all">
                    *144*2*1*06887330*500#
                  </span>
                </div>
                <p className="text-[11px] text-orange-100/80 leading-relaxed">
                  Clique sur le bouton ci-dessous pour composer automatiquement le code USSD sur ton téléphone.
                </p>
                <a
                  href="tel:*144*2*1*06887330*500%23"
                  className="flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg active:scale-95"
                >
                  <PhoneCall size={16} />
                  Composer *144*2*1*06887330*500#
                </a>
              </div>
            )}

            {paymentMethod === "MOOV_MONEY" && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-200">Numéro Moov Money :</span>
                  <span className="font-mono font-black text-emerald-300 bg-black/40 px-2 py-1 rounded-lg border border-emerald-500/30 select-all">
                    06887330
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                  Effectue ton transfert Moov Money au numéro <strong>06887330</strong> (USSD *155#).
                </p>
                <a
                  href="tel:*155%23"
                  className="flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg active:scale-95"
                >
                  <PhoneCall size={16} />
                  Composer *155# sur téléphone
                </a>
              </div>
            )}

            {paymentMethod === "WAVE" && (
              <div className="rounded-2xl border border-sky-400/40 bg-sky-950/30 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-200">Compte Wave :</span>
                  <span className="font-mono font-black text-sky-300 bg-black/40 px-2 py-1 rounded-lg border border-sky-400/30 select-all">
                    06887330
                  </span>
                </div>
                <p className="text-[11px] text-sky-100/80 leading-relaxed">
                  Clique ci-dessous pour ouvrir directement ton compte Wave et faire le transfert vers <strong>06887330</strong>.
                </p>
                <a
                  href="https://wave.com/send?phone=06887330"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg active:scale-95"
                >
                  <ExternalLink size={16} />
                  Payer directement via l'application Wave (06887330)
                </a>
              </div>
            )}

            {/* PAYMENT TRANSACTION INPUTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div>
                <label htmlFor="paymentPhone" className="mb-1.5 block text-xs font-black uppercase text-cyan-300">
                  Numéro ayant payé
                </label>
                <input
                  id="paymentPhone"
                  type="tel"
                  required
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  placeholder="Ex: 06887330"
                  className="h-12 w-full rounded-full bg-white px-5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none shadow-inner focus:ring-4 focus:ring-cyan-300/80 focus:border-cyan-300 transition"
                />
              </div>

              <div>
                <label htmlFor="paymentRef" className="mb-1.5 block text-xs font-black uppercase text-cyan-300">
                  ID / Réf Transaction
                </label>
                <input
                  id="paymentRef"
                  type="text"
                  required
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="Ex: PP240906.1420..."
                  className="h-12 w-full rounded-full bg-white px-5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none shadow-inner focus:ring-4 focus:ring-cyan-300/80 focus:border-cyan-300 transition"
                />
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
                CREATION DU COMPTE & VERIFICATION...
              </>
            ) : (
              <>
                VALIDER L'INSCRIPTION & LE PAIEMENT
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


