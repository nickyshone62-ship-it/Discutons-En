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
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/accueil"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Retour à l'accueil
        </Link>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
          <ShieldCheck size={14} />
          Publication 100% Anonyme
        </span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Partager un problème
        </h1>
        <p className="mt-2 text-base leading-6 text-slate-500">
          Exprime-toi librement. La communauté est là pour écouter, partager des expériences et trouver des solutions ensemble.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 space-y-6"
      >
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {/* CATEGORY SELECTOR */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Catégorie du problème
          </label>

          {loadingCategories ? (
            <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-100" />
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
                        ? "border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-200 font-bold"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <span className="text-lg">{cat.icon || "💬"}</span>
                    <span className="truncate text-xs font-semibold">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* TITLE INPUT */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="title"
              className="block text-sm font-bold text-slate-800"
            >
              Titre explicite
            </label>
            <span className="text-xs text-slate-400">
              {title.length}/150
            </span>
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
            className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        {/* CONTENT TEXTAREA */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="content"
              className="block text-sm font-bold text-slate-800"
            >
              Description détaillée
            </label>
            <span className="text-xs text-slate-400">
              {content.length}/5000 (min 20)
            </span>
          </div>

          <textarea
            id="content"
            required
            rows={7}
            minLength={20}
            maxLength={5000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Raconte ta situation, tes ressentis ou les questions précises que tu te poses..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-normal leading-relaxed outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        {/* ANONYMITY INFO BOX */}
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-start gap-3">
          <div className="rounded-xl bg-sky-100 p-2 text-sky-600 shrink-0">
            <Sparkles size={18} />
          </div>
          <div className="text-xs text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-900 mb-0.5">
              Rappel d'anonymat
            </p>
            Ton message sera publié sous ton identité anonyme attribuée. Ton nom réel, ton email et tes données privées ne seront jamais affichés.
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/accueil"
            className="rounded-2xl px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-slate-950/10"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Publication en cours...
              </>
            ) : (
              <>
                Publier le problème
                <Send size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
