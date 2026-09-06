"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Shield,
  ShieldCheck,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Users,
  Search,
  Loader2,
  Trash2,
  Phone,
  Hash,
  Clock,
  ArrowLeft,
  RefreshCw,
  MessageSquare,
  FileText,
  CreditCard,
  ShieldAlert,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { OrangeMoneyLogo, MoovMoneyLogo, WaveLogo } from "@/components/auth/PaymentLogos";

type AdminUser = {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  paymentMethod: "ORANGE_MONEY" | "MOOV_MONEY" | "WAVE" | null;
  paymentPhone: string | null;
  paymentRef: string | null;
  createdAt: string;
};

type AdminStats = {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"PENDING" | "ALL" | "STATS">("PENDING");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function fetchAdminData() {
    setLoading(true);
    setLoginError("");
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch("/api/admin/users", { cache: "no-store" }),
        fetch("/api/admin/stats", { cache: "no-store" }),
      ]);

      if (usersRes.status === 403 || statsRes.status === 403) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      const usersData = await usersRes.json();
      const statsData = await statsRes.json();

      if (usersRes.ok && usersData.success) {
        setUsers(usersData.users);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }

      if (statsRes.ok && statsData.success) {
        setStats(statsData.stats);
      }
    } catch {
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setLoginError(data.message || "Identifiants administrateur incorrects.");
        return;
      }

      if (data.user?.role !== "ADMIN" && data.user?.role !== "SUPER_ADMIN") {
        setLoginError("Ce compte est un compte utilisateur. Vous devez vous connecter avec un compte Administrateur.");
        return;
      }

      setIsAuthorized(true);
      await fetchAdminData();
    } catch {
      setLoginError("Impossible de contacter le serveur.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleUserAction(userId: string, action: string, extraData: any = {}) {
    setActionLoading(userId);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, ...extraData }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessage({ type: "success", text: data.message });
        await fetchAdminData();
      } else {
        setMessage({ type: "error", text: data.message || "Action impossible." });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau." });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteUser(userId: string, username: string) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${username} ?`)) {
      return;
    }
    setActionLoading(userId);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMessage({ type: "success", text: data.message });
        await fetchAdminData();
      } else {
        setMessage({ type: "error", text: data.message || "Erreur de suppression." });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau." });
    } finally {
      setActionLoading(null);
    }
  }

  const pendingUsers = users.filter(
    (u) => !u.isApproved && u.approvalStatus === "PENDING"
  );

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.firstName && u.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.lastName && u.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.paymentPhone && u.paymentPhone.includes(searchQuery)) ||
      (u.paymentRef && u.paymentRef.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === "PENDING") return matchesSearch && !u.isApproved && u.approvalStatus === "PENDING";
    if (statusFilter === "APPROVED") return matchesSearch && u.isApproved;
    if (statusFilter === "REJECTED") return matchesSearch && u.approvalStatus === "REJECTED";
    if (statusFilter === "ADMIN") return matchesSearch && u.role === "ADMIN";
    return matchesSearch;
  });

  function renderPaymentBadge(method: string | null) {
    if (method === "ORANGE_MONEY") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-black text-orange-300 border border-orange-500/40">
          <OrangeMoneyLogo className="h-4 w-4" /> Orange Money
        </span>
      );
    }
    if (method === "MOOV_MONEY") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300 border border-emerald-500/40">
          <MoovMoneyLogo className="h-4 w-4" /> Moov Money
        </span>
      );
    }
    if (method === "WAVE") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-black text-sky-300 border border-sky-400/40">
          <WaveLogo className="h-4 w-4" /> Wave
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300 border border-slate-700">
        Non renseigné
      </span>
    );
  }

  if (!isAuthorized && !loading) {
    return (
      <div className="min-h-screen bg-[#070913] text-white flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-black">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[140px]" />
        </div>

        <div className="relative z-10 w-full max-w-md rounded-[36px] border border-purple-400/40 bg-slate-950/80 p-8 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-500/20 border border-purple-400/50 text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            <Shield size={40} />
          </div>

          <div>
            <span className="inline-block rounded-full bg-purple-500/20 px-3 py-1 text-xs font-black text-purple-300 uppercase tracking-widest border border-purple-400/30 mb-2">
              Accès Securisé
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-wider">
              Espace Administrateur
            </h1>
            <p className="text-xs text-cyan-100/70 mt-1">
              Connecte-toi avec tes identifiants Administrateur pour gérer la plateforme.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            {loginError && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/20 p-3 text-xs font-bold text-red-200 text-center">
                {loginError}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-black text-purple-300 uppercase">
                Email ou Identifiant Admin
              </label>
              <input
                type="text"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="ex: admin@discutons-en.com"
                className="h-12 w-full rounded-2xl bg-white/10 px-4 text-sm font-semibold text-white placeholder-slate-400 outline-none border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-black text-purple-300 uppercase">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 w-full rounded-2xl bg-white/10 px-4 text-sm font-semibold text-white placeholder-slate-400 outline-none border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 hover:brightness-110 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(168,85,247,0.5)] transition disabled:opacity-50"
            >
              {loginLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Se Connecter à l'Administration
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
            <Link href="/inscription" className="text-cyan-300 font-bold hover:underline">
              ← Retour à l'inscription
            </Link>
            <Link href="/accueil" className="text-slate-400 hover:text-white transition">
              Accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-white selection:bg-cyan-500 selection:text-black">
      {/* BACKGROUND GLOW */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-cyan-400/30 bg-slate-950/70 p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4">
            <Link
              href="/accueil"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-cyan-300 hover:text-white transition border border-white/10"
              title="Retour à l'accueil"
            >
              <ArrowLeft size={22} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-cyan-400" />
                <h1 className="text-2xl font-black font-display tracking-tight text-white uppercase">
                  ESPACE ADMINISTRATEUR
                </h1>
              </div>
              <p className="text-xs text-cyan-100/70 mt-0.5">
                Validation des paiements (Orange Money, Moov Money, Wave) & Gestion de la plateforme DIScutons-En.
              </p>
            </div>
          </div>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/40 px-4 py-2 text-xs font-black uppercase tracking-wider transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>

        {/* FEEDBACK MESSAGES */}
        {message && (
          <div
            className={`rounded-2xl p-4 text-xs font-bold border shadow-lg flex items-center justify-between ${
              message.type === "success"
                ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-200"
                : "bg-red-500/20 border-red-400/50 text-red-200"
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-white/60 hover:text-white">
              ×
            </button>
          </div>
        )}

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-amber-400/30 bg-amber-950/20 p-5 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between text-amber-300">
              <span className="text-xs font-black uppercase tracking-wider">Paiements En Attente</span>
              <Clock size={20} />
            </div>
            <p className="text-3xl font-black font-display text-white">{stats?.pendingCount ?? 0}</p>
            <p className="text-[10px] text-amber-200/70">Comptes à approuver</p>
          </div>

          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-950/20 p-5 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between text-emerald-300">
              <span className="text-xs font-black uppercase tracking-wider">Comptes Validés</span>
              <CheckCircle size={20} />
            </div>
            <p className="text-3xl font-black font-display text-white">{stats?.approvedCount ?? 0}</p>
            <p className="text-[10px] text-emerald-200/70">Paiements confirmés</p>
          </div>

          <div className="rounded-3xl border border-cyan-400/30 bg-cyan-950/20 p-5 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between text-cyan-300">
              <span className="text-xs font-black uppercase tracking-wider">Total Membres</span>
              <Users size={20} />
            </div>
            <p className="text-3xl font-black font-display text-white">{stats?.totalUsers ?? 0}</p>
            <p className="text-[10px] text-cyan-200/70">Inscrits sur la plateforme</p>
          </div>

          <div className="rounded-3xl border border-purple-400/30 bg-purple-950/20 p-5 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between text-purple-300">
              <span className="text-xs font-black uppercase tracking-wider">Publications</span>
              <FileText size={20} />
            </div>
            <p className="text-3xl font-black font-display text-white">{stats?.totalPosts ?? 0}</p>
            <p className="text-[10px] text-purple-200/70">Discussions publiées</p>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider transition ${
              activeTab === "PENDING"
                ? "bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                : "bg-white/5 text-cyan-100 hover:bg-white/15"
            }`}
          >
            <Clock size={16} />
            Demandes en attente
            {pendingUsers.length > 0 && (
              <span className="rounded-full bg-red-500 text-white px-2 py-0.5 text-[10px] font-black">
                {pendingUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("ALL")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider transition ${
              activeTab === "ALL"
                ? "bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                : "bg-white/5 text-cyan-100 hover:bg-white/15"
            }`}
          >
            <Users size={16} />
            Tous les Utilisateurs
          </button>

          <button
            onClick={() => setActiveTab("STATS")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider transition ${
              activeTab === "STATS"
                ? "bg-purple-400 text-slate-950 shadow-[0_0_20px_rgba(192,132,252,0.4)]"
                : "bg-white/5 text-cyan-100 hover:bg-white/15"
            }`}
          >
            <ShieldAlert size={16} />
            Plateforme & Modération
          </button>
        </div>

        {/* TAB 1: PENDING APPROVALS */}
        {activeTab === "PENDING" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black font-display uppercase tracking-wide text-amber-300 flex items-center gap-2">
                Inscriptions & Paiements à Vérifier ({pendingUsers.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-cyan-400" size={36} />
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-12 text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-white">Toutes les demandes ont été traitées !</h3>
                <p className="text-xs text-cyan-100/60">Aucun compte en attente de validation de paiement pour le moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingUsers.map((u) => (
                  <div
                    key={u.id}
                    className="rounded-3xl border border-amber-400/30 bg-slate-950/80 p-6 backdrop-blur-xl space-y-4 shadow-xl hover:border-amber-400/60 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-cyan-300">
                          @{u.username}
                        </span>
                        <h3 className="text-lg font-black text-white">
                          {u.firstName || ""} {u.lastName || ""}
                        </h3>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                      {renderPaymentBadge(u.paymentMethod)}
                    </div>

                    {/* PAYMENT PROOF INFO */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Phone size={13} className="text-cyan-400" /> Numéro de Paiement :
                        </span>
                        <span className="font-mono font-bold text-cyan-300">{u.paymentPhone || "Non renseigné"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Hash size={13} className="text-amber-400" /> ID / Référence :
                        </span>
                        <span className="font-mono font-bold text-amber-300">{u.paymentRef || "Non renseigné"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock size={13} className="text-slate-400" /> Date inscription :
                        </span>
                        <span className="text-slate-300">{new Date(u.createdAt).toLocaleString("fr-FR")}</span>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => handleUserAction(u.id, "APPROVE")}
                        disabled={actionLoading === u.id}
                        className="flex-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50"
                      >
                        {actionLoading === u.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <CheckCircle size={16} /> Approuver le compte
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleUserAction(u.id, "REJECT")}
                        disabled={actionLoading === u.id}
                        className="flex h-11 px-4 items-center justify-center gap-1.5 rounded-xl border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold text-xs uppercase transition disabled:opacity-50"
                      >
                        <XCircle size={16} /> Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL USERS MANAGEMENT */}
        {activeTab === "ALL" && (
          <div className="space-y-6">
            {/* SEARCH AND FILTERS BAR */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-3 text-cyan-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher nom, pseudo, tel..."
                  className="h-11 w-full rounded-2xl border border-white/20 bg-slate-950/80 pl-11 pr-4 text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
                {[
                  { id: "ALL", label: "Tous" },
                  { id: "PENDING", label: "En Attente" },
                  { id: "APPROVED", label: "Approuvés" },
                  { id: "REJECTED", label: "Rejetés" },
                  { id: "ADMIN", label: "Admins" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                      statusFilter === f.id
                        ? "bg-cyan-400 text-slate-950 font-black"
                        : "bg-white/5 text-slate-300 hover:bg-white/15"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* USERS TABLE */}
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-white/5 text-cyan-300 uppercase font-black tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">Utilisateur</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Moyen Paiement</th>
                      <th className="p-4">Tél & Réf</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4">Rôle</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Aucun utilisateur ne correspond aux critères de recherche.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/5 transition">
                          <td className="p-4">
                            <div className="font-bold text-white">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="text-[11px] text-cyan-400">@{u.username}</div>
                          </td>
                          <td className="p-4 text-slate-300 font-mono">{u.email}</td>
                          <td className="p-4">{renderPaymentBadge(u.paymentMethod)}</td>
                          <td className="p-4 font-mono text-[11px]">
                            <div>Tél: <span className="text-cyan-300">{u.paymentPhone || "-"}</span></div>
                            <div>Réf: <span className="text-amber-300">{u.paymentRef || "-"}</span></div>
                          </td>
                          <td className="p-4">
                            {u.isApproved || u.approvalStatus === "APPROVED" ? (
                              <span className="inline-block rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-500/40">
                                Validé
                              </span>
                            ) : u.approvalStatus === "REJECTED" ? (
                              <span className="inline-block rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-black text-red-300 border border-red-500/40">
                                Rejeté
                              </span>
                            ) : (
                              <span className="inline-block rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-300 border border-amber-500/40">
                                En Attente
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                              u.role === "ADMIN" ? "bg-purple-500/20 text-purple-300 border border-purple-400/40" : "bg-slate-800 text-slate-400"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!u.isApproved && (
                                <button
                                  onClick={() => handleUserAction(u.id, "APPROVE")}
                                  className="rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 p-2 hover:bg-emerald-500/40 transition"
                                  title="Approuver"
                                >
                                  <CheckCircle size={15} />
                                </button>
                              )}
                              <button
                                onClick={() => handleUserAction(u.id, "SET_ROLE", { role: u.role === "ADMIN" ? "USER" : "ADMIN" })}
                                className="rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/40 p-2 hover:bg-purple-500/40 transition"
                                title={u.role === "ADMIN" ? "Rétrograder en utilisateur" : "Promouvoir en Administrateur"}
                              >
                                <Shield size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                className="rounded-lg bg-red-500/20 text-red-300 border border-red-400/40 p-2 hover:bg-red-500/40 transition"
                                title="Supprimer le compte"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PLATFORM & CONTENT STATS */}
        {activeTab === "STATS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-lg font-black font-display uppercase text-cyan-300 flex items-center gap-2">
                <FileText size={20} /> Métriques Générales
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-300">Total Utilisateurs enregistrés :</span>
                  <span className="font-bold text-cyan-300">{stats?.totalUsers}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-300">Paiements validés :</span>
                  <span className="font-bold text-emerald-300">{stats?.approvedCount}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-300">Paiements en attente :</span>
                  <span className="font-bold text-amber-300">{stats?.pendingCount}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-300">Total Publications du forum :</span>
                  <span className="font-bold text-purple-300">{stats?.totalPosts}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-300">Total Commentaires :</span>
                  <span className="font-bold text-sky-300">{stats?.totalComments}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-lg font-black font-display uppercase text-cyan-300 flex items-center gap-2">
                <CreditCard size={20} /> Moyens de Paiement Supportés
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-orange-950/20 border border-orange-500/30 space-y-1">
                  <div className="flex items-center gap-2 text-orange-300 font-black text-sm">
                    <OrangeMoneyLogo className="h-6 w-6" /> Orange Money
                  </div>
                  <p className="text-orange-100/80">Code USSD direct : <code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-300">*144*2*1*06887330*500#</code></p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 font-black text-sm">
                    <MoovMoneyLogo className="h-6 w-6" /> Moov Money
                  </div>
                  <p className="text-emerald-100/80">Numéro de réception : <code className="bg-black/50 px-1.5 py-0.5 rounded text-emerald-300">06887330</code> (USSD *155#)</p>
                </div>

                <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-400/30 space-y-1">
                  <div className="flex items-center gap-2 text-sky-300 font-black text-sm">
                    <WaveLogo className="h-6 w-6" /> Wave
                  </div>
                  <p className="text-sky-100/80">Lien Wave direct : <code className="bg-black/50 px-1.5 py-0.5 rounded text-sky-300">https://wave.com/send?phone=06887330</code></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
