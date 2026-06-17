"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export function LoginForm({ isConfigured }: { isConfigured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isConfigured) {
      router.push("/dashboard");
      return;
    }

    setIsLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setIsLoading(false);

    if (signInError) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    // Forcer le changement de mot de passe si c'est la première connexion
    if (signInData.user?.user_metadata?.must_change_password) {
      router.push("/profile?force=1");
      router.refresh();
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function onResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResetError(null);
    setResetLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail })
    });
    const json = await res.json();
    setResetLoading(false);
    if (!res.ok) { setResetError(json.error ?? "Erreur"); return; }
    setResetDone(true);
  }

  const domain = email.includes("@") ? email.split("@")[1] : "";
  const universityHint = domain ? domain.split(".")[0].toUpperCase() : null;

  return (
    <div className="w-full">
      {/* Modal mot de passe oublié */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">Réinitialiser le mot de passe</h2>
              <button type="button" onClick={() => { setShowReset(false); setResetDone(false); setResetError(null); setResetEmail(""); }} className="rounded-md p-1 text-muted hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            {resetDone ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 className="h-10 w-10 text-brand-600" />
                <p className="text-sm font-semibold text-ink">Email envoyé !</p>
                <p className="text-xs text-muted">Consulte ta boîte mail et clique sur le lien pour choisir un nouveau mot de passe.</p>
                <button type="button" onClick={() => { setShowReset(false); setResetDone(false); }} className="mt-2 text-xs font-semibold text-brand-600 hover:underline">Fermer</button>
              </div>
            ) : (
              <form onSubmit={onResetSubmit} className="space-y-4">
                <p className="text-sm text-muted">Saisis ton email universitaire et on t'envoie un lien pour réinitialiser ton mot de passe.</p>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="ton@email.com"
                    required
                    className="h-11 w-full rounded-xl border border-line pl-10 pr-3 text-sm transition placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                {resetError && <p className="text-xs text-coral-500">{resetError}</p>}
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
                >
                  {resetLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : "Envoyer le lien"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Logo + titre */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-soft">
          SD
        </div>
        <h1 className="text-2xl font-bold text-ink">Bienvenue sur SamaDepot</h1>
        <p className="mt-1 text-sm text-muted">
          Dépose tes travaux en quelques secondes
        </p>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-6 shadow-soft">

        {!isConfigured ? (
          <div className="mb-5 flex gap-3 rounded-xl bg-saffron-50 p-3 text-sm text-saffron-500">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            Mode démo — clique pour accéder au prototype.
          </div>
        ) : null}

        {/* Email */}
        <div className="relative">
          <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="email">
            Email universitaire
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@ucad.edu.sn"
              required
              className="focus-ring h-12 w-full rounded-xl border border-line pl-10 pr-3 text-sm transition placeholder:text-muted focus:border-brand-500"
            />
          </div>
          {universityHint ? (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Université détectée : {universityHint}
            </div>
          ) : null}
        </div>

        {/* Mot de passe */}
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="password">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required={isConfigured}
              className="focus-ring h-12 w-full rounded-xl border border-line pl-10 pr-3 text-sm transition placeholder:text-muted focus:border-brand-500"
            />
          </div>
        </div>

        {error ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-coral-50 px-3 py-2.5 text-sm text-coral-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="focus-ring mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              {isConfigured ? "Se connecter" : "Accéder au prototype"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="mt-5 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => { setShowReset(true); setResetEmail(email); }}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            Mot de passe oublié ?
          </button>
          <p className="text-center text-xs text-muted">
            Ton compte est créé par l'administration de ton université.
          </p>
        </div>
      </form>
    </div>
  );
}
