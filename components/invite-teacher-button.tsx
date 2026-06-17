"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Link2, Loader2, MessageCircle, X } from "lucide-react";

export function InviteTeacherButton() {
  const [open, setOpen] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setError(null);
    setIsLoading(true);
    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "teacher", expiresInDays }),
    });
    const json = await res.json();
    setIsLoading(false);
    if (!res.ok) { setError(json.error ?? "Erreur"); return; }
    setResult(json.data);
  }

  async function copy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function whatsapp() {
    if (!result) return;
    const text = `👋 Voici ton lien pour créer ton compte professeur sur SamaDepot :\n\n${result.url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function reset() {
    setOpen(false);
    setResult(null);
    setError(null);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-lagoon-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-lagoon-400"
      >
        <Link2 className="h-4 w-4" />
        Générer un lien d&apos;invitation
      </button>
    );
  }

  if (result) {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2 rounded-lg border border-lagoon-200 bg-white p-2.5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lagoon-500" />
          <p className="break-all font-mono text-[11px] text-ink">{result.url}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={copy} className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white py-2 text-xs font-semibold text-ink hover:bg-slate-50">
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copié !" : "Copier"}
          </button>
          <button onClick={whatsapp} className="flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] py-2 text-xs font-bold text-white hover:opacity-90">
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </button>
        </div>
        <button onClick={reset} className="w-full text-center text-xs text-muted hover:text-ink hover:underline">
          Fermer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-ink">Valide pendant</span>
        <button onClick={reset} className="text-muted hover:text-ink">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <select
        value={expiresInDays}
        onChange={(e) => setExpiresInDays(Number(e.target.value))}
        className="h-9 w-full rounded-lg border border-line bg-white px-2 text-sm"
      >
        <option value={7}>7 jours</option>
        <option value={15}>15 jours</option>
        <option value={30}>30 jours</option>
        <option value={90}>3 mois</option>
      </select>
      {error && <p className="text-xs text-coral-500">{error}</p>}
      <button
        onClick={generate}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-lagoon-500 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Link2 className="h-3.5 w-3.5" />Générer</>}
      </button>
    </div>
  );
}
