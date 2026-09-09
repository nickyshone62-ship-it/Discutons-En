"use client";

import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { FormEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Check,
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
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err);
      setError("Impossible de contacter le serveur. Vérifie ta connexion.");
    } finally {
      setLoading(false);
    }
  }

  if (pendingSuccess) {
    return (
      <div className="relative w-full max-w-lg mx-auto my-10">
        <div className="rounded-[36px] border border-pink-100 bg-white p-8 sm:p-10 shadow-[0_25px_65px_rgba(0,0,0,0.06)] text-slate-900 text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 text-[#ff2a6d] border-2 border-pink-200 animate-pulse">
            <Clock size={40} />
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-[#ff2a6d] uppercase tracking-widest border border-pink-200">
              En attente d'approbation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
              Compte Créé avec Succès !
            </h2>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {successMessage || "Votre compte a été enregistré. Un administrateur va vérifier votre paiement et activer votre compte sous peu."}
          </p>

          <div className="rounded-2xl border border-pink-100 bg-[#f4f3f6] p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-semibold text-slate-500">Moyen de paiement :</span>
              <span className="font-black text-slate-900 flex items-center gap-1.5">
                {paymentMethod === "ORANGE_MONEY" && <><OrangeMoneyLogo className="h-5 w-5" /> Orange Money</>}
                {paymentMethod === "MOOV_MONEY" && <><MoovMoneyLogo className="h-5 w-5" /> Moov Money</>}
                {paymentMethod === "WAVE" && <><WaveLogo className="h-5 w-5" /> Wave</>}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-semibold text-slate-500">Numéro de paiement :</span>
              <span className="font-mono font-bold text-[#ff2a6d]">{paymentPhone}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-semibold text-slate-500">Référence transaction :</span>
              <span className="font-mono font-bold text-[#ff2a6d]">{paymentRef}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/connexion"
              className="flex h-12 items-center justify-center gap-2 rounded-2xl btn-pink font-extrabold text-xs uppercase tracking-wider transition shadow-lg px-6"
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
      {/* BECKY LIGHT CARD CONTAINER */}
      <div className="rounded-[36px] border border-pink-100/70 bg-white p-6 sm:p-10 shadow-[0_25px_65px_rgba(0,0,0,0.06)] text-slate-900">
        <div className="mb-6 text-center">
          <Logo variant="full" size="lg" href="/" className="mb-2" />

          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-slate-900">
            Créer un compte
          </h1>

          <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500 max-w-sm mx-auto">
            Crée ton compte avec ton nom & prénom et choisis parmi <strong>100 Avatars Bitmoji</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 text-center shadow-sm"
            >
              {error}
            </div>
          )}

          {/* SNAPCHAT BITMOJI AVATAR PICKER */}
          <div className="rounded-3xl border border-pink-100 bg-[#f8f7f9] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 text-[#ff2a6d] shadow-sm font-bold text-lg">
                  👻
                </div>
                <div>
                  <h2 className="text-xs font-extrabold font-display uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    100 Avatars Bitmoji
                    <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] text-[#ff2a6d] font-bold border border-pink-200">
                      100 au choix
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Clique pour choisir ou mélange au hasard 🔀
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRandomize}
                  className="rounded-full bg-white border border-pink-200 px-3 py-1.5 text-[11px] font-bold text-[#ff2a6d] hover:bg-pink-50 transition flex items-center gap-1 shadow-sm"
                  title="Choisir un avatar au hasard"
                >
                  🔀 Aleatoire
                </button>

                <img
                  src={currentAvatarUrl}
                  alt="Aperçu Bitmoji"
                  className="h-12 w-12 rounded-full border-2 border-[#ff2a6d] shadow-md transition transform hover:scale-105"
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
                  className={`shrink-0 rounded-full px-3.5 py-1 text-[11px] font-bold transition ${
                    activeCategory === tab.id
                      ? "btn-pink font-extrabold shadow-sm"
                      : "bg-white text-slate-600 hover:bg-pink-50 border border-slate-200"
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
                    className={`group relative flex flex-col items-center justify-center rounded-2xl p-1.5 transition duration-200 transform active:scale-95 ${
                      isSelected
                        ? "border-2 border-[#ff2a6d] bg-pink-50 shadow-md scale-105"
                        : "border border-slate-200/60 bg-white hover:border-pink-300 hover:bg-pink-50/40"
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
                        <div className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#ff2a6d] text-white shadow-md">
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
              <label htmlFor="firstName" className="mb-1.5 block text-xs font-bold text-slate-700">
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
                className="h-12 w-full rounded-2xl bg-[#f4f3f6] px-5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#ff2a6d] transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="mb-1.5 block text-xs font-bold text-slate-700">
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
                className="h-12 w-full rounded-2xl bg-[#f4f3f6] px-5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#ff2a6d] transition-all duration-200"
              />
            </div>
          </div>

          {/* USERNAME & EMAIL INPUTS */}
          <div className="space-y-3.5">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs font-bold text-slate-700">
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
                className="h-12 w-full rounded-2xl bg-[#f4f3f6] px-5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#ff2a6d] transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-slate-700">
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
                className="h-12 w-full rounded-2xl bg-[#f4f3f6] px-5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#ff2a6d] transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="relative">
                <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-slate-700">
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
                  className="h-12 w-full rounded-2xl bg-[#f4f3f6] px-5 pr-12 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#ff2a6d] transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[36px] text-slate-400 hover:text-slate-700 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-bold text-slate-700">
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
                  className="h-12 w-full rounded-2xl bg-[#f4f3f6] px-5 pr-12 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#ff2a6d] transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-[36px] text-slate-400 hover:text-slate-700 transition"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* MOYEN DE PAIEMENT SECTION */}
          <div className="rounded-3xl border border-pink-100 bg-[#f8f7f9] p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff2a6d] text-white font-extrabold shadow-sm">
                <CreditCard size={20} />
              </div>
              <div>
                <h2 className="text-xs font-extrabold font-display uppercase tracking-wider text-slate-900">
                  Moyen de Paiement à l'inscription
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Sélectionne ton moyen de paiement et effectue le transfert vers le numéro <strong>06887330</strong>.
                </p>
              </div>
            </div>

            {/* PAYMENT LOGO SELECTOR TABS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("ORANGE_MONEY")}
                className={`flex flex-col items-center justify-center rounded-2xl p-3 border transition duration-200 ${
                  paymentMethod === "ORANGE_MONEY"
                    ? "border-[#ff2a6d] bg-pink-50 shadow-sm"
                    : "border-slate-200 bg-white hover:bg-pink-50/50"
                }`}
              >
                <OrangeMoneyLogo className="h-8 w-8 mb-1" />
                <span className="text-[11px] font-bold text-slate-800">Orange Money</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("WAVE")}
                className={`flex flex-col items-center justify-center rounded-2xl p-3 border transition duration-200 ${
                  paymentMethod === "WAVE"
                    ? "border-[#ff2a6d] bg-pink-50 shadow-sm"
                    : "border-slate-200 bg-white hover:bg-pink-50/50"
                }`}
              >
                <WaveLogo className="h-8 w-8 mb-1" />
                <span className="text-[11px] font-bold text-slate-800">Wave</span>
              </button>

              <div className="col-span-2 sm:col-span-1 opacity-50 cursor-not-allowed flex flex-col items-center justify-center rounded-2xl p-3 border border-slate-200 bg-white">
                <MoovMoneyLogo className="h-8 w-8 mb-1 grayscale" />
                <span className="text-[10px] font-bold text-slate-400">Moov (Bientôt)</span>
              </div>
            </div>

            {/* PAYMENT METHOD DETAILS & DIRECT ACTION BUTTONS */}
            {paymentMethod === "ORANGE_MONEY" && (
              <div className="rounded-2xl border border-pink-200 bg-pink-50/80 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Code USSD Orange Money :</span>
                  <span className="font-mono font-black text-[#ff2a6d] bg-white px-2 py-1 rounded-lg border border-pink-200 select-all">
                    *144*2*1*06887330*500#
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Clique sur le bouton ci-dessous pour composer automatiquement le code USSD sur ton téléphone.
                </p>
                <a
                  href="tel:*144*2*1*06887330*500%23"
                  className="flex items-center justify-center gap-2 h-11 w-full rounded-2xl btn-pink font-extrabold text-xs uppercase tracking-wider transition shadow-md active:scale-95"
                >
                  <PhoneCall size={16} />
                  Composer *144*2*1*06887330*500#
                </a>
              </div>
            )}

            {paymentMethod === "WAVE" && (
              <div className="rounded-2xl border border-pink-200 bg-pink-50/80 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Compte Wave :</span>
                  <span className="font-mono font-black text-[#ff2a6d] bg-white px-2 py-1 rounded-lg border border-pink-200 select-all">
                    06887330
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Clique ci-dessous pour ouvrir directement ton compte Wave et faire le transfert vers <strong>06887330</strong>.
                </p>
                <a
                  href="https://wave.com/send?phone=06887330"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-11 w-full rounded-2xl btn-pink font-extrabold text-xs uppercase tracking-wider transition shadow-md active:scale-95"
                >
                  <ExternalLink size={16} />
                  Payer directement via l'application Wave (06887330)
                </a>
              </div>
            )}

            {/* PAYMENT TRANSACTION INPUTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label htmlFor="paymentPhone" className="mb-1.5 block text-xs font-bold text-slate-700">
                  Numéro ayant payé
                </label>
                <input
                  id="paymentPhone"
                  type="tel"
                  required
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  placeholder="Ex: 06887330"
                  className="h-12 w-full rounded-2xl bg-[#f4f3f6] px-5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#ff2a6d] transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="paymentRef" className="mb-1.5 block text-xs font-bold text-slate-700">
                  ID / Réf Transaction
                </label>
                <input
                  id="paymentRef"
                  type="text"
                  required
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="Ex: PP240906.1420..."
                  className="h-12 w-full rounded-2xl bg-[#f4f3f6] px-5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#ff2a6d] transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* TERMS CHECKBOX */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 rounded accent-[#ff2a6d] cursor-pointer"
              />
              <span>
                J'accepte les{" "}
                <span className="text-slate-900 font-bold underline hover:text-[#ff2a6d] transition">
                  Conditions d'Utilisation
                </span>
              </span>
            </label>
          </div>

          {/* HOT PINK GRADIENT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl btn-pink font-extrabold font-display text-sm uppercase tracking-wider transition-all duration-300 transform active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin text-white" />
                CRÉATION DU COMPTE & VÉRIFICATION...
              </>
            ) : (
              <>
                CRÉER UN COMPTE
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs font-medium text-slate-600">
            Vous avez déjà un compte ?{" "}
            <Link
              href="/connexion"
              className="font-bold text-slate-900 hover:text-[#ff2a6d] transition"
            >
              Se connecter
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
