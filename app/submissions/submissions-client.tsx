"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileX2,
  RefreshCw,
  ReceiptText,
  RotateCcw
} from "lucide-react";
import { useState, useMemo } from "react";
import type { Submission, SubmissionStatus } from "@/types";
import { cn } from "@/lib/utils";

const STEPS: { key: string; label: string }[] = [
  { key: "received", label: "Reçu" },
  { key: "read", label: "Lu" },
  { key: "validated", label: "Validé" },
  { key: "graded", label: "Noté" }
];

const STEP_ORDER: Record<string, number> = {
  received: 0,
  late: 0,
  read: 1,
  validated: 2,
  returned: 2,
  graded: 3,
  rejected: -1
};

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  received: { label: "Reçu",       color: "text-lagoon-500 bg-lagoon-50",  icon: CheckCircle2 },
  read:     { label: "Lu",         color: "text-saffron-500 bg-saffron-50", icon: Eye },
  validated:{ label: "Validé",     color: "text-brand-600 bg-brand-50",    icon: BadgeCheck },
  graded:   { label: "Noté",       color: "text-brand-600 bg-brand-50",    icon: BadgeCheck },
  returned: { label: "À corriger", color: "text-saffron-500 bg-saffron-50", icon: RotateCcw },
  rejected: { label: "Refusé",     color: "text-coral-500 bg-coral-50",    icon: FileX2 },
  late:     { label: "En retard",  color: "text-coral-500 bg-coral-50",    icon: Clock }
};

const FILTER_TABS: { key: "all" | SubmissionStatus; label: string }[] = [
  { key: "all",       label: "Tous" },
  { key: "received",  label: "Reçu" },
  { key: "read",      label: "Lu" },
  { key: "validated", label: "Validé" },
  { key: "graded",    label: "Noté" },
  { key: "returned",  label: "À corriger" },
  { key: "rejected",  label: "Refusé" },
];

function ProgressBar({ status }: { status: string }) {
  if (status === "rejected") {
    return (
      <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-coral-500">
        <FileX2 className="h-3.5 w-3.5" />
        Dépôt refusé
      </div>
    );
  }
  const current = STEP_ORDER[status] ?? 0;
  return (
    <div className="mb-3 flex items-center gap-1">
      {STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div key={step.key} className="flex flex-1 flex-col items-center gap-1">
            <div className={cn("h-1.5 w-full rounded-full transition-all", done ? "bg-brand-600" : "bg-slate-200")} />
            {active && <span className="text-[10px] font-bold text-brand-600">{step.label}</span>}
          </div>
        );
      })}
    </div>
  );
}

function SubmissionRow({ submission }: { submission: Submission }) {
  const meta = STATUS_META[submission.status] ?? STATUS_META.received;
  const Icon = meta.icon;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-soft">
      <div className="px-4 pt-4">
        <ProgressBar status={submission.status} />
      </div>
      <div className="flex items-start justify-between gap-4 px-4 pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-bold text-ink">{submission.spaceTitle}</h3>
            {submission.isLate && (
              <span className="shrink-0 rounded-full bg-coral-50 px-2 py-0.5 text-[10px] font-bold text-coral-500">Retard</span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted">{submission.fileName} · {submission.sizeMb} Mo</p>
          <p className="mt-0.5 text-xs text-muted">
            Déposé le {submission.submittedAt}
            {submission.deadline ? ` · Deadline : ${submission.deadline}` : ""}
          </p>
          {submission.reviewComment && (
            <div className="mt-2 rounded-lg bg-saffron-50 px-3 py-2 text-xs leading-5 text-saffron-500">
              <span className="font-semibold">Note du prof :</span> {submission.reviewComment}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", meta.color)}>
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
          </span>
          {submission.grade && (
            <span className="text-lg font-bold text-brand-600">{submission.grade}</span>
          )}
        </div>
      </div>
      <div className="flex gap-px border-t border-line">
        <Link
          href={`/submissions/${submission.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-muted transition hover:bg-slate-50 hover:text-ink"
        >
          <ReceiptText className="h-3.5 w-3.5" />
          Récépissé
        </Link>
        <Link
          href={`/api/submissions/${submission.id}/download`}
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-muted transition hover:bg-slate-50 hover:text-ink"
        >
          <Download className="h-3.5 w-3.5" />
          Télécharger
        </Link>
        {(submission.status === "returned" || submission.status === "rejected") && (
          <Link
            href="/spaces"
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-saffron-500 transition hover:bg-saffron-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Redéposer
          </Link>
        )}
      </div>
    </div>
  );
}

export function SubmissionsClient({ submissions }: { submissions: Submission[] }) {
  const [filter, setFilter] = useState<"all" | SubmissionStatus>("all");

  const filtered = useMemo(
    () => filter === "all" ? submissions : submissions.filter((s) => s.status === filter),
    [submissions, filter]
  );

  // Tabs visibles uniquement si des statuts correspondants existent
  const availableTabs = useMemo(
    () => FILTER_TABS.filter((t) =>
      t.key === "all" || submissions.some((s) => s.status === t.key)
    ),
    [submissions]
  );

  if (submissions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Clock className="h-6 w-6 text-muted" />
        </div>
        <p className="mt-3 text-sm font-bold text-ink">Aucun dépôt encore</p>
        <p className="mt-1 text-sm text-muted">Tes travaux déposés apparaîtront ici avec leur statut en temps réel.</p>
        <Link
          href="/spaces"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
        >
          Voir les espaces de dépôt
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const attention = filtered.filter((s) => ["returned", "rejected"].includes(s.status));
  const pending   = filtered.filter((s) => ["received", "read", "late"].includes(s.status));
  const validated = filtered.filter((s) => ["validated", "graded"].includes(s.status));

  return (
    <div className="space-y-6">
      {/* Barre de filtre */}
      {availableTabs.length > 2 && (
        <div className="flex flex-wrap gap-1.5">
          {availableTabs.map((tab) => {
            const count = tab.key === "all"
              ? submissions.length
              : submissions.filter((s) => s.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  filter === tab.key
                    ? "bg-brand-600 text-white"
                    : "bg-white border border-line text-muted hover:text-ink"
                )}
              >
                {tab.label}
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  filter === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-muted"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
          <p className="text-sm text-muted">Aucun dépôt avec ce statut</p>
        </div>
      )}

      {attention.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-bold text-ink">Action requise</h2>
            <span className="rounded-full bg-saffron-50 px-2 py-0.5 text-xs font-bold text-saffron-500">{attention.length}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {attention.map((s) => <SubmissionRow key={s.id} submission={s} />)}
          </div>
        </section>
      )}

      {pending.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-bold text-ink">En cours d'évaluation</h2>
            <span className="rounded-full bg-lagoon-50 px-2 py-0.5 text-xs font-bold text-lagoon-500">{pending.length}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {pending.map((s) => <SubmissionRow key={s.id} submission={s} />)}
          </div>
        </section>
      )}

      {validated.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-bold text-ink">Validés / Notés</h2>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600">{validated.length}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {validated.map((s) => <SubmissionRow key={s.id} submission={s} />)}
          </div>
        </section>
      )}
    </div>
  );
}
