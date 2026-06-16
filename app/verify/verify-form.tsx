"use client";

import { useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CalendarClock,
  FileText,
  Hash,
  Loader2,
  Search,
  ShieldCheck,
  XCircle
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  received: "Reçu",
  read: "Lu",
  validated: "Validé",
  graded: "Noté",
  returned: "À corriger",
  rejected: "Refusé",
  late: "En retard"
};

const STATUS_COLOR: Record<string, string> = {
  received: "bg-lagoon-50 text-lagoon-500",
  read: "bg-saffron-50 text-saffron-500",
  validated: "bg-brand-50 text-brand-600",
  graded: "bg-brand-50 text-brand-600",
  returned: "bg-saffron-50 text-saffron-500",
  rejected: "bg-coral-50 text-coral-500",
  late: "bg-coral-50 text-coral-500"
};

type VerifyResult = {
  id: string;
  student: string;
  studentEmail: string | null;
  studentNumber: string | null;
  fileName: string;
  spaceTitle: string;
  spaceType: string;
  submittedAt: string;
  deadline: string | null;
  status: string;
  sizeMb: number;
  hash: string;
  version: number;
  isLate: boolean;
  grade: string | null;
};

export function VerifyForm({ prefillId }: { prefillId?: string }) {
  const [query, setQuery] = useState(prefillId ?? "");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);

    const res = await fetch(`/api/verify?id=${encodeURIComponent(query.trim().toUpperCase())}`);
    setLoading(false);

    if (!res.ok) {
      setNotFound(true);
      return;
    }

    const data = await res.json();
    setResult(data);
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Formulaire de recherche */}
      <form onSubmit={onSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setResult(null); setNotFound(false); }}
            placeholder="SD-2026-00421"
            className="h-12 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-sm font-mono font-semibold uppercase tracking-wider text-ink placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vérifier"}
        </button>
      </form>

      {/* Résultat introuvable */}
      {notFound && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-coral-50 bg-coral-50 p-5">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-coral-500" />
          <div>
            <p className="text-sm font-bold text-coral-500">Récépissé introuvable</p>
            <p className="mt-1 text-xs text-coral-500/80">
              Aucun dépôt ne correspond à l'identifiant <span className="font-mono font-semibold">{query.trim().toUpperCase()}</span>. Vérifiez l'orthographe.
            </p>
          </div>
        </div>
      )}

      {/* Résultat trouvé */}
      {result && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
          {/* Bandeau vert */}
          <div className="flex items-center gap-3 bg-brand-600 px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Dépôt authentique vérifié</p>
              <p className="text-xs text-white/70">Ce dépôt est enregistré dans SamaDepot</p>
            </div>
            <span className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLOR[result.status] ?? "bg-slate-100 text-muted"}`}>
              {STATUS_LABELS[result.status] ?? result.status}
            </span>
          </div>

          <div className="divide-y divide-line">
            {/* Étudiant */}
            <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
              <Row label="Étudiant" value={result.student} />
              {result.studentNumber && <Row label="Numéro étudiant" value={result.studentNumber} />}
              {result.studentEmail && <Row label="Email" value={result.studentEmail} />}
              <Row label="Récépissé" value={result.id} mono />
            </div>

            {/* Espace / Travail */}
            <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
              <Row label="Espace de dépôt" value={result.spaceTitle} />
              <Row label="Type" value={result.spaceType} />
              <Row label="Date du dépôt" value={result.submittedAt} />
              {result.deadline && <Row label="Deadline" value={result.deadline} />}
              {result.isLate && (
                <div className="flex items-center gap-2 rounded-lg bg-coral-50 px-3 py-2 text-xs font-semibold text-coral-500 md:col-span-2">
                  <AlertCircle className="h-4 w-4" />
                  Dépôt effectué après la deadline
                </div>
              )}
            </div>

            {/* Fichier */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                <FileText className="h-3.5 w-3.5" />
                Fichier transmis
              </div>
              <div className="mt-2 flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                <span className="truncate text-sm font-semibold text-ink">{result.fileName}</span>
                <span className="shrink-0 text-xs text-muted">{result.sizeMb} Mo · v{result.version}</span>
              </div>
            </div>

            {/* SHA-256 */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                <Hash className="h-3.5 w-3.5" />
                Empreinte SHA-256
              </div>
              <p className="mt-2 break-all rounded-xl bg-slate-50 px-4 py-3 font-mono text-xs leading-5 text-muted">
                {result.hash}
              </p>
            </div>

            {/* Note si disponible */}
            {result.grade && (
              <div className="flex items-center gap-3 px-5 py-4">
                <BadgeCheck className="h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Note attribuée</p>
                  <p className="text-xl font-bold text-brand-600">{result.grade}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-5 py-3 text-xs text-muted">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" />
            Vérifié via SamaDepot · {new Date().toLocaleDateString("fr-FR", { dateStyle: "long" })}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold text-ink ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
