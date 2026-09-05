"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";

type AccountData = {
  account: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    role: string;
    createdAt: string;
  };
  identity: {
    anonymousName: string;
    avatarUrl: string;
  };
  stats: {
    postsCount: number;
    commentsCount: number;
  };
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AccountProfile() {
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadAccount() {
      try {
        const response = await fetch("/api/account", {
          cache: "no-store",
        });

        if (response.status === 401) {
          window.location.href = "/connexion";
          return;
        }

        const result = await response.json();

        if (response.ok && result.success) {
          setData(result);
        } else {
          setError(result.message || "Impossible de charger votre compte.");
        }
      } catch {
        setError("Erreur réseau. Vérifiez votre connexion.");
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, []);

  async function handleDeleteAccount() {
    setDeleting(true);

    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        window.location.href = "/";
      } else {
        alert(result.message || "Erreur lors de la suppression.");
        setDeleting(false);
        setShowDeleteModal(false);
      }
    } catch {
      alert("Erreur de connexion.");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/";
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-10 w-36 animate-pulse rounded-full bg-white/10" />
        <div className="h-48 animate-pulse rounded-3xl bg-white/10" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md my-12 rounded-3xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-xl shadow-2xl text-white">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-red-300 font-bold text-xl">
          !
        </div>
        <h1 className="mt-4 text-xl font-bold text-white">
          Une erreur est survenue
        </h1>
        <p className="mt-2 text-xs text-cyan-100/80">{error}</p>
        <Link
          href="/accueil"
          className="mt-6 inline-flex rounded-full bg-cyan-400 px-6 py-3 text-xs font-black uppercase text-slate-950 shadow-lg shadow-cyan-400/40"
        >
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20 text-white">
      {/* HEADER NAVIGATION */}
      <div className="flex items-center justify-between">
        <Link
          href="/accueil"
          className="inline-flex items-center gap-2 text-xs font-bold text-cyan-200 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Retour à l'accueil
        </Link>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/20 hover:text-red-400 transition"
        >
          <LogOut size={14} />
          Se déconnecter
        </button>
      </div>

      {/* ANONYMOUS PROFILE CARD */}
      <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <img
            src={data.identity.avatarUrl}
            alt={data.identity.anonymousName}
            className="h-20 w-20 rounded-full border-4 border-cyan-400/50 shadow-lg shrink-0"
          />

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400/20 px-3 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-400/30">
                <ShieldCheck size={14} />
                Profil Anonyme Bitmoji
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">
              {data.identity.anonymousName}
            </h1>

            <p className="text-xs text-cyan-200/80 flex items-center justify-center sm:justify-start gap-1.5">
              <Calendar size={13} />
              Membre depuis le {formatDate(data.account.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* ACTIVITY STATS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl border border-white/20 bg-white/10 p-5 text-center shadow-xl backdrop-blur-xl">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-300 mb-2 border border-cyan-400/30">
            <MessageSquare size={20} />
          </div>
          <p className="text-2xl font-black text-white">
            {data.stats.postsCount}
          </p>
          <p className="text-xs font-medium text-cyan-200/80">
            Problèmes partagés
          </p>
        </div>

        <div className="rounded-3xl border border-white/20 bg-white/10 p-5 text-center shadow-xl backdrop-blur-xl">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300 mb-2 border border-emerald-400/30">
            <MessageCircle size={20} />
          </div>
          <p className="text-2xl font-black text-white">
            {data.stats.commentsCount}
          </p>
          <p className="text-xs font-medium text-cyan-200/80">
            Réponses apportées
          </p>
        </div>
      </div>

      {/* PRIVATE CONFIDENTIAL INFO */}
      <div className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-wider">
              Informations privées
              <Lock size={16} className="text-cyan-300" />
            </h2>
            <p className="text-xs text-cyan-200/80">
              Ces informations sont strictement confidentielles et restent masquées aux autres membres.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {(data.account.firstName || data.account.lastName) && (
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 border border-white/15">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-cyan-300 shrink-0">
                <User size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-cyan-200/80 uppercase">
                  Nom & Prénom Réels (Confidentiel)
                </p>
                <p className="text-sm font-bold text-white">
                  {data.account.firstName ?? ""} {data.account.lastName ?? ""}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 border border-white/15">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-cyan-300 shrink-0">
              <User size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-cyan-200/80 uppercase">
                Nom d'utilisateur privé
              </p>
              <p className="text-sm font-bold text-white">
                @{data.account.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 border border-white/15">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-cyan-300 shrink-0">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-cyan-200/80 uppercase">
                Adresse email
              </p>
              <p className="text-sm font-bold text-white">
                {data.account.email}
              </p>
            </div>
          </div>
        </div>
      </div>



      {/* DANGER ZONE - ACCOUNT DELETION */}
      <div className="rounded-3xl border border-red-500/40 bg-red-950/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 shrink-0 border border-red-500/40">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-red-200 tracking-wider">
              Zone de danger — Suppression du compte
            </h3>
            <p className="text-xs text-red-300/80">
              La suppression de votre compte est définitive et irréversible.
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-red-200/90">
          En supprimant votre compte, votre profil, votre identité anonyme ainsi que vos publications et messages seront définitivement effacés de nos serveurs.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition shadow-lg shadow-red-600/30"
        >
          <Trash2 size={16} />
          Supprimer mon compte définitivement
        </button>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-5 border border-white/20 text-white">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40">
              <AlertTriangle size={28} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-white">
                Confirmer la suppression
              </h3>
              <p className="text-xs leading-relaxed text-slate-300">
                Êtes-vous sûr de vouloir supprimer définitivement votre compte <strong>@{data.account.username}</strong> ? Cette action ne peut pas être annulée.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 rounded-full border border-white/20 bg-white/10 py-3 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-red-600 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-red-500 transition disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    Oui, supprimer
                    <Trash2 size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
