import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  FileCheck2,
  FolderPlus,
  Users
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAcademicOptions, getSpaceTracking, getSpaces, getSubmissions } from "@/lib/data";
import { CreateSpaceWizard } from "./create-space-wizard";
import { ReviewForm } from "./review-form";
import { cn } from "@/lib/utils";
import type { SubmissionSpace } from "@/types";

function SpaceTrackCard({ space }: { space: SubmissionSpace }) {
  const pct = space.expected > 0 ? Math.min(100, Math.round((space.submissions / space.expected) * 100)) : 0;
  const isExpired = space.status === "expired";

  const statusColor = {
    open: "bg-brand-50 text-brand-600",
    soon: "bg-saffron-50 text-saffron-500",
    urgent: "bg-coral-50 text-coral-500",
    expired: "bg-slate-100 text-muted"
  };
  const statusLabel = {
    open: "Ouvert",
    soon: "Bientôt",
    urgent: "Urgent",
    expired: "Fermé"
  };

  return (
    <div className={cn(
      "flex flex-col rounded-2xl border bg-white p-4 transition",
      isExpired ? "border-line opacity-70" : "border-line hover:shadow-soft"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted">
            {space.type}
          </span>
          <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", statusColor[space.status])}>
            {statusLabel[space.status]}
          </span>
        </div>
      </div>

      <h3 className="mt-2.5 text-sm font-bold text-ink leading-snug">{space.title}</h3>
      <p className="mt-0.5 text-xs text-muted">{space.subject ?? space.department}</p>

      {/* Compteur rendus */}
      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-ink">{space.submissions} rendu{space.submissions > 1 ? "s" : ""}</span>
          <span className="text-muted">sur {space.expected} attendus · {pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn("h-full rounded-full transition-all", isExpired ? "bg-slate-300" : "bg-brand-600")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {space.deadline}
        </span>
      </div>

      <Link
        href={`/teacher/spaces/${space.id}`}
        className="mt-3 flex h-9 items-center justify-center gap-2 rounded-xl bg-brand-600 text-xs font-bold text-white transition hover:bg-brand-500"
      >
        <Users className="h-3.5 w-3.5" />
        Voir le suivi de classe
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export default async function TeacherPage() {
  const [submissions, spaces, academicOptions] = await Promise.all([
    getSubmissions(),
    getSpaces(),
    getAcademicOptions()
  ]);

  const current = submissions[0];
  const toReview = submissions.filter((s) => ["received", "read", "late"].includes(s.status));

  return (
    <AppShell active="Professeur">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Espace professeur</h1>
          <p className="mt-1 text-sm text-muted">
            {toReview.length > 0
              ? `${toReview.length} dépôt${toReview.length > 1 ? "s" : ""} à évaluer`
              : "Tout est à jour — aucun dépôt en attente"}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-ink">{spaces.filter(s => s.status !== "expired").length}</p>
            <p className="text-xs font-semibold text-muted">Espaces actifs</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lagoon-50 text-lagoon-500">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-ink">{toReview.length}</p>
            <p className="text-xs font-semibold text-muted">À évaluer</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-ink">
              {submissions.filter(s => ["validated", "graded"].includes(s.status)).length}
            </p>
            <p className="text-xs font-semibold text-muted">Validés / Notés</p>
          </div>
        </div>
      </div>

      {/* Mes espaces + suivi */}
      {spaces.length > 0 && (
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-bold text-ink">Suivi de mes classes</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {spaces.map((space) => (
              <SpaceTrackCard key={space.id} space={space} />
            ))}
          </div>
        </section>
      )}

      {/* Créer un espace + évaluation rapide */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <FolderPlus className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-bold text-ink">Créer un espace de dépôt</h2>
          </div>
          <CreateSpaceWizard options={academicOptions} />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-bold text-ink">Évaluation rapide</h2>
            </div>
            {submissions.length > 1 && (
              <Link href="/submissions" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                Voir tous <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {!current ? (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white p-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-brand-600" />
              <p className="mt-3 text-sm font-bold text-ink">Aucun dépôt à évaluer</p>
              <p className="mt-1 text-xs text-muted">
                Les dépôts de tes étudiants apparaîtront ici dès qu'ils soumettent leur travail.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <ReviewForm submission={current} />

              {/* File des suivants */}
              {submissions.length > 1 && (
                <div className="overflow-hidden rounded-2xl border border-line bg-white">
                  <div className="border-b border-line bg-slate-50 px-4 py-2.5">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">
                      File d'attente ({submissions.length - 1})
                    </p>
                  </div>
                  {submissions.slice(1, 6).map((sub, i) => (
                    <Link
                      key={sub.id}
                      href={`/submissions/${sub.id}`}
                      className={cn(
                        "flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-slate-50",
                        i > 0 && "border-t border-line"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{sub.student}</p>
                        <p className="truncate text-xs text-muted">{sub.fileName} · {sub.spaceTitle}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {sub.grade && <span className="text-sm font-bold text-brand-600">{sub.grade}</span>}
                        <StatusBadge status={sub.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
