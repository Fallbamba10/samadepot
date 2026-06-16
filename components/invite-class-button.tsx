"use client";

import { useState } from "react";
import { Copy, Link2, Loader2, MessageCircle, Share2, X } from "lucide-react";
import type { AcademicClass } from "@/types";

export function InviteClassButton({ classes }: { classes: AcademicClass[] }) {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; className: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setError(null);
    setResult(null);
    setIsLoading(true);

    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, expiresInDays })
    });
    const json = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setError(json.error ?? "Impossible de créer le lien");
      return;
    }
    setResult(json.data);
  }

  async function copyUrl() {
    if (!result) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!result) return;
    const text = `📚 Rejoins SamaDepot pour déposer tes travaux en ligne !\n\nClasse : ${result.className}\nLien d'inscription : ${result.url}\n\nInscris-toi directement depuis ce lien, c'est gratuit.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-100"
      >
        <Link2 className="h-4 w-4" />
        Inviter des étudiants
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Share2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">Lien d'invitation par classe</h3>
            <p className="text-xs text-muted">
              Les étudiants s'inscrivent eux-mêmes en cliquant sur le lien
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setOpen(false); setResult(null); setError(null); }}
          className="rounded-md p-1 text-muted hover:bg-slate-100 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {!result ? (
        <div className="mt-4 grid gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-ink">Classe</span>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm focus:border-brand-500 focus:outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.level}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-ink">Valide pendant</span>
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              className="mt-1 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value={7}>7 jours</option>
              <option value={15}>15 jours</option>
              <option value={30}>30 jours</option>
              <option value={90}>3 mois</option>
              <option value={365}>1 an</option>
            </select>
          </label>

          {error ? (
            <p className="text-xs text-coral-500">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={generate}
            disabled={isLoading || !classId}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                Générer le lien
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-brand-50 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-brand-600">
              Lien pour {result.className}
            </p>
            <p className="break-all text-xs font-mono text-ink">{result.url}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={copyUrl}
              className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-slate-50"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copié !" : "Copier"}
            </button>
            <button
              type="button"
              onClick={shareWhatsApp}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
          </div>

          <button
            type="button"
            onClick={() => setResult(null)}
            className="w-full text-center text-xs text-muted hover:text-ink hover:underline"
          >
            Générer un autre lien
          </button>
        </div>
      )}
    </div>
  );
}
