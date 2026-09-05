"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
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
        <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-48 animate-pulse rounded-3xl bg-white" />
        <div className="h-64 animate-pulse rounded-3xl bg-white" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md my-12 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 font-bold text-xl">
          !
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-950">
          Une erreur est survenue
        </h1>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <Link
          href="/accueil"
          className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
        >
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      {/* HEADER NAVIGATION */}
      <div className="flex items-center justify-between">
        <Link
          href="/accueil"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Retour à l'accueil
        </Link>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-red-600 transition"
        >
          <LogOut size={14} />
          Se déconnecter
        </button>
      </div>

      {/* ANONYMOUS PROFILE CARD */}
      <div className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <img
            src={data.identity.avatarUrl}
            alt={data.identity.anonymousName}
            className="h-20 w-20 rounded-full border-4 border-white/20 shadow-lg shrink-0"
          />

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 px-3 py-0.5 text-xs font-bold text-sky-400 border border-sky-500/30">
                <ShieldCheck size={14} />
                Profil Anonyme Public
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {data.identity.anonymousName}
            </h1>

            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Calendar size={13} />
              Membre depuis le {formatDate(data.account.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* ACTIVITY STATS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 mb-2">
            <MessageSquare size={20} />
          </div>
          <p className="text-2xl font-black text-slate-950">
            {data.stats.postsCount}
          </p>
          <p className="text-xs font-medium text-slate-400">
            Problèmes partagés
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-2">
            <MessageCircle size={20} />
          </div>
          <p className="text-2xl font-black text-slate-950">
            {data.stats.commentsCount}
          </p>
          <p className="text-xs font-medium text-slate-400">
            Réponses apportées
          </p>
        </div>
      </div>

      {/* PRIVATE CONFIDENTIAL INFO */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
              Informations privées
              <Lock size={16} className="text-slate-400" />
            </h2>
            <p className="text-xs text-slate-400">
              Ces informations sont strictement confidentielles et restent masquées aux autres membres.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm shrink-0">
              <User size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">
                Nom d'utilisateur privé
              </p>
              <p className="text-sm font-bold text-slate-900">
                @{data.account.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm shrink-0">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">
                Adresse email
              </p>
              <p className="text-sm font-bold text-slate-900">
                {data.account.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DANGER ZONE - ACCOUNT DELETION */}
      <div className="rounded-3xl border border-red-200 bg-red-50/50 p-6 shadow-sm sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-600 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-950">
              Zone de danger — Suppression du compte
            </h3>
            <p className="text-xs text-red-600/80">
              La suppression de votre compte est définitive et irréversible.
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-red-800">
          En supprimant votre compte, votre profil, votre identité anonyme ainsi que vos publications et messages seront définitivement effacés de nos serveurs.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-red-700 shadow-md shadow-red-600/20"
        >
          <Trash2 size={16} />
          Supprimer mon compte définitivement
        </button>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle size={28} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-950">
                Confirmer la suppression
              </h3>
              <p className="text-xs leading-relaxed text-slate-500">
                Êtes-vous sûr de vouloir supprimer définitivement votre compte <strong>@{data.account.username}</strong> ? Cette action ne peut pas être annulée.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 transition disabled:opacity-60"
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
