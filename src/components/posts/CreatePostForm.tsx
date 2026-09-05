"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
};

export default function CreatePostForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/posts", {
          cache: "no-store",
        });

        if (response.status === 401) {
          window.location.href = "/connexion";
          return;
        }

        const data = await response.json();

        if (response.ok && data.success) {
          setCategories(data.categories || []);
          if (data.categories && data.categories.length > 0) {
            setCategoryId(data.categories[0].id);
          }
        } else {
          setError("Impossible de charger les catégories.");
        }
      } catch {
        setError("Erreur réseau. Vérifie ta connexion.");
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim() || title.trim().length < 5) {
      setError("Le titre doit contenir au moins 5 caractères.");
      return;
    }

    if (!content.trim() || content.trim().length < 20) {
      setError("Explique ton problème un peu plus en détail (minimum 20 caractères).");
      return;
    }

    if (!categoryId) {
      setError("Choisis une catégorie adaptée à ton sujet.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          categoryId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Impossible de publier votre problème.");
        return;
      }

      window.location.href = "/accueil";
    } catch {
      setError("Impossible de contacter le serveur. Vérifie ta connexion.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto text-white">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/accueil"
          className="inline-flex items-center gap-2 text-xs font-bold text-cyan-200 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Retour à l'accueil
        </Link>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-400/30">
          <ShieldCheck size={14} />
          Publication 100% Anonyme
        </span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-widest text-white uppercase drop-shadow-md">
          PARTAGER UN PROBLÈME
        </h1>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-cyan-100/80">
          Exprime-toi librement. La communauté est là pour écouter, partager des expériences et trouver des solutions ensemble.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8 space-y-6"
      >
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-400/40 bg-red-500/20 px-4 py-3 text-xs font-bold text-red-200 text-center"
          >
            {error}
          </div>
        )}

        {/* CATEGORY SELECTOR */}
        <div>
          <label className="mb-2 block text-xs font-black uppercase text-cyan-300">
            Catégorie du problème
          </label>

          {loadingCategories ? (
            <div className="h-12 w-full animate-pulse rounded-2xl bg-white/10" />
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-400/20 text-white font-bold ring-2 ring-cyan-400/50"
                        : "border-white/15 bg-white/5 text-cyan-100/90 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{cat.icon || "💬"}</span>
                    <span className="truncate text-xs font-bold">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* TITLE INPUT */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="title" className="block text-xs font-black uppercase text-cyan-300">
              Titre explicite
            </label>
            <span className="text-[10px] text-cyan-200/70">{title.length}/150</span>
          </div>

          <input
            id="title"
            type="text"
            required
            minLength={5}
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Comment gérer le stress des examens sans paniquer ?"
            className="h-12 w-full rounded-full bg-white px-5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition shadow-inner focus:ring-4 focus:ring-cyan-300"
          />
        </div>

        {/* CONTENT TEXTAREA */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="content" className="block text-xs font-black uppercase text-cyan-300">
              Description détaillée
            </label>
            <span className="text-[10px] text-cyan-200/70">{content.length}/5000 (min 20)</span>
          </div>

          <textarea
            id="content"
            required
            rows={6}
            minLength={20}
            maxLength={5000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Raconte ta situation, tes ressentis ou les questions précises que tu te poses..."
            className="w-full rounded-3xl bg-white p-4 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition shadow-inner focus:ring-4 focus:ring-cyan-300 leading-relaxed"
          />
        </div>

        {/* ANONYMITY INFO BOX */}
        <div className="rounded-2xl bg-cyan-400/10 p-4 border border-cyan-400/30 flex items-start gap-3 text-cyan-100">
          <Sparkles size={18} className="text-amber-300 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-white mb-0.5">Rappel d'anonymat</p>
            Ton message sera publié sous ton identité anonyme attribuée. Ton email et tes données privées ne seront jamais affichés.
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/accueil"
            className="rounded-full px-5 py-3 text-xs font-bold text-cyan-200 hover:text-white transition"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-400 hover:bg-cyan-300 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 transition shadow-lg shadow-cyan-400/40 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                PUBLICATION EN COURS...
              </>
            ) : (
              <>
                PUBLIER LE PROBLÈME
                <Send size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
