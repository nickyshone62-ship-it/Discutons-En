"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Calendar,
  Check,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Trash2,
  User,
  Volume2,
} from "lucide-react";
import {
  playNotificationChime,
  sendBrowserNotification,
} from "@/utils/audioNotification";
import {
  requestNotificationPermission,
  subscribeUserToPush,
} from "@/utils/pushNotifications";

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

  // Notification state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("default");
  const [activatingNotif, setActivatingNotif] = useState(false);
  const [notifSuccessMessage, setNotifSuccessMessage] = useState("");

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

    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    } else {
      setNotifPermission("unsupported");
    }
  }, []);

  async function handleActivateNotifications() {
    setActivatingNotif(true);
    setNotifSuccessMessage("");

    try {
      const perm = await requestNotificationPermission();
      setNotifPermission(perm);

      if (perm === "granted") {
        playNotificationChime();
        const sub = await subscribeUserToPush();

        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sub.toJSON()),
          }).catch(() => {});
        }

        sendBrowserNotification(
          "💬 Notifications activées !",
          "Vous recevrez désormais des alertes instantanées pour chaque nouveau message.",
          data?.identity?.avatarUrl
        );

        setNotifSuccessMessage("Notifications activées avec succès !");
      } else if (perm === "denied") {
        alert(
          "Les notifications ont été bloquées dans les paramètres de votre navigateur. Veuillez autoriser les notifications dans le cadenas / paramètres du site."
        );
      }
    } catch (e) {
      console.error("Activation error:", e);
      alert("Erreur lors de l'activation des notifications.");
    } finally {
      setActivatingNotif(false);
    }
  }

  function handleTestSound() {
    playNotificationChime();
    sendBrowserNotification(
      "🔔 Test de notification Discutons-En",
      "Le son et les alertes fonctionnent parfaitement sur votre appareil !",
      data?.identity?.avatarUrl
    );
  }

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
        <div className="h-10 w-36 animate-pulse rounded-full bg-pink-100/50" />
        <div className="h-48 animate-pulse rounded-3xl bg-white" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md my-12 rounded-3xl border border-pink-200 bg-white p-8 text-center shadow-xl text-slate-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-500 font-bold text-xl border border-red-200">
          !
        </div>
        <h1 className="mt-4 text-xl font-extrabold font-display text-slate-900">
          Une erreur est survenue
        </h1>
        <p className="mt-2 text-xs text-slate-600 font-medium">{error}</p>
        <Link
          href="/accueil"
          className="mt-6 inline-flex rounded-full btn-pink px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md"
        >
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20 text-slate-900 font-sans">
      {/* HEADER NAVIGATION */}
      <div className="flex items-center justify-between">
        <Link
          href="/accueil"
          className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-700 hover:text-[#ff2a6d] transition"
        >
          <ArrowLeft size={16} />
          Retour à l'accueil
        </Link>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition shadow-xs"
        >
          <LogOut size={14} />
          Se déconnecter
        </button>
      </div>

      {/* ANONYMOUS PROFILE CARD */}
      <div className="overflow-hidden rounded-3xl border border-pink-100/80 bg-white p-6 shadow-xl sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <img
            src={data.identity.avatarUrl}
            alt={data.identity.anonymousName}
            className="h-20 w-20 rounded-full border-4 border-[#ff2a6d] shadow-md shrink-0 object-cover"
          />

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-3 py-0.5 text-xs font-extrabold text-[#ff2a6d] border border-pink-200">
                <ShieldCheck size={14} />
                Profil Anonyme Bitmoji
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900">
              {data.identity.anonymousName}
            </h1>

            <p className="text-xs text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1.5">
              <Calendar size={13} className="text-[#ff2a6d]" />
              Membre depuis le {formatDate(data.account.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* ACTIVITY STATS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl border border-pink-100/80 bg-white p-5 text-center shadow-lg">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-50 text-[#ff2a6d] mb-2 border border-pink-200">
            <MessageSquare size={20} />
          </div>
          <p className="text-2xl font-black font-display text-slate-900">
            {data.stats.postsCount}
          </p>
          <p className="text-xs font-semibold text-slate-500">
            Problèmes partagés
          </p>
        </div>

        <div className="rounded-3xl border border-pink-100/80 bg-white p-5 text-center shadow-lg">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-50 text-[#ff2a6d] mb-2 border border-pink-200">
            <MessageCircle size={20} />
          </div>
          <p className="text-2xl font-black font-display text-slate-900">
            {data.stats.commentsCount}
          </p>
          <p className="text-xs font-semibold text-slate-500">
            Réponses apportées
          </p>
        </div>
      </div>

      {/* NOTIFICATIONS & ALERTS CONTROL CARD */}
      <div className="rounded-3xl border border-pink-200 bg-white p-6 shadow-xl sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-pink-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-[#ff2a6d] border border-pink-200 shadow-xs">
              <Bell size={22} className="animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-black font-display uppercase tracking-wider text-slate-900 flex items-center gap-2">
                Notifications Mobiles & Alerte Sonore
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Gérez vos alertes instantanées sur iPhone, Android et ordinateur.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-pink-100 bg-[#fbf9fa] p-4">
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                Statut des notifications :
                {notifPermission === "granted" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700">
                    <Check size={12} /> Activées
                  </span>
                )}
                {notifPermission === "default" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800">
                    En attente de permission
                  </span>
                )}
                {(notifPermission === "denied" || notifPermission === "unsupported") && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-200 px-2.5 py-0.5 text-[11px] font-extrabold text-red-700">
                    Bloquées ou non gérées
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Recevez le son "Ding-Dong" et un pop-up d'alerte lors de la réception d'un nouveau message.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleActivateNotifications}
                disabled={activatingNotif}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl btn-pink px-5 py-2.5 text-xs font-black font-display uppercase tracking-wider text-white shadow-md active:scale-95 disabled:opacity-50"
              >
                {activatingNotif ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Activation...
                  </>
                ) : (
                  <>
                    <Bell size={15} />
                    Activer les notifications
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestSound}
                className="rounded-2xl border border-pink-200 bg-white p-2.5 text-slate-700 hover:bg-pink-50 hover:text-[#ff2a6d] transition shadow-xs"
                title="Tester le son de notification"
              >
                <Volume2 size={18} />
              </button>
            </div>
          </div>

          {notifSuccessMessage && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 px-4 text-xs font-bold text-emerald-700 text-center">
              {notifSuccessMessage}
            </div>
          )}
        </div>
      </div>

      {/* PRIVATE CONFIDENTIAL INFO */}
      <div className="rounded-3xl border border-pink-100/80 bg-white p-6 shadow-xl sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-pink-100 pb-4">
          <div>
            <h2 className="text-base font-black font-display text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              Informations privées
              <Lock size={16} className="text-[#ff2a6d]" />
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Ces informations sont strictement confidentielles et restent masquées aux autres membres.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {(data.account.firstName || data.account.lastName) && (
            <div className="flex items-center gap-3 rounded-2xl bg-[#f8f7f9] p-4 border border-slate-200/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-[#ff2a6d] shrink-0">
                <User size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Nom & Prénom Réels (Confidentiel)
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {data.account.firstName ?? ""} {data.account.lastName ?? ""}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 rounded-2xl bg-[#f8f7f9] p-4 border border-slate-200/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-[#ff2a6d] shrink-0">
              <User size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">
                Nom d'utilisateur privé
              </p>
              <p className="text-sm font-bold text-slate-900">
                @{data.account.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#f8f7f9] p-4 border border-slate-200/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-[#ff2a6d] shrink-0">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">
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
      <div className="rounded-3xl border border-red-200 bg-red-50/70 p-6 shadow-xl sm:p-8 space-y-4 text-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-600 shrink-0 border border-red-200">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black font-display uppercase text-red-700 tracking-wider">
              Zone de danger — Suppression du compte
            </h3>
            <p className="text-xs text-red-600 font-medium">
              La suppression de votre compte est définitive et irréversible.
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-red-700 font-medium">
          En supprimant votre compte, votre profil, votre identité anonyme ainsi que vos publications et messages seront définitivement effacés de nos serveurs.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white transition shadow-md"
        >
          <Trash2 size={16} />
          Supprimer mon compte définitivement
        </button>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-5 border border-pink-100 text-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 border border-red-200">
              <AlertTriangle size={28} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-extrabold font-display text-slate-900">
                Confirmer la suppression
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 font-medium">
                Êtes-vous sûr de vouloir supprimer définitivement votre compte <strong>@{data.account.username}</strong> ? Cette action ne peut pas être annulée.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 rounded-full border border-slate-200 bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-red-600 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-red-700 transition disabled:opacity-60 shadow-md"
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
