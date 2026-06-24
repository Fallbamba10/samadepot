"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-coral-50">
          <AlertTriangle className="h-8 w-8 text-coral-400" />
        </div>
        <p className="mb-2 font-mono text-5xl font-extrabold text-coral-200">500</p>
        <h1 className="mb-3 text-xl font-extrabold text-ink">Une erreur est survenue</h1>
        <p className="mb-8 text-sm leading-relaxed text-muted">
          Quelque chose s&apos;est mal passé. Veuillez réessayer ou contacter le support si le problème persiste.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </button>
      </div>
    </main>
  );
}
