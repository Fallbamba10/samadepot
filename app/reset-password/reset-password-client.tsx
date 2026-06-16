"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export function ResetPasswordClient() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase met le token dans le hash (#access_token=...&type=recovery)
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      const supabase = createSupabaseBrowserClient();
      // exchangeCodeForSession gère le hash automatiquement via onAuthStateChange
      supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
        }
      });
    } else {
      setError("Lien invalide ou expiré. Refais une demande de réinitialisation.");
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Minimum 8 caractères"); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return; }

    setIsLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (updateError) { setError(updateError.message); return; }

    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2500);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-brand-100 bg-white p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand-600" />
        <h2 className="mt-4 text-lg font-bold text-ink">Mot de passe mis à jour !</h2>
        <p className="mt-2 text-sm text-muted">Redirection en cours…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-soft">
          SD
        </div>
        <h1 className="text-2xl font-bold text-ink">Nouveau mot de passe</h1>
        <p className="mt-1 text-sm text-muted">Choisis un mot de passe sécurisé</p>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        {!ready && !error ? (
          <div className="flex justify-center py-6">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="h-12 w-full rounded-xl border border-line pl-10 pr-3 text-sm transition placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 w-full rounded-xl border border-line pl-10 pr-3 text-sm transition placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-coral-50 px-3 py-2.5 text-sm text-coral-500">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {ready && (
              <button
                type="submit"
                disabled={isLoading}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
              >
                {isLoading
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : "Enregistrer le nouveau mot de passe"
                }
              </button>
            )}
          </>
        )}
      </form>
    </div>
  );
}
