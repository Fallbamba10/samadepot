import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  FileX2,
  RotateCcw,
  TableProperties,
  Users
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getSpaceTracking } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { SpaceStudent } from "@/types";

const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  received:  { label: "Reçu",       color: "text-lagoon-500", dot: "bg-lagoon-500" },
  read:      { label: "Lu",         color: "text-saffron-500", dot: "bg-saffron-500" },
  validated: { label: "Validé",     color: "text-brand-600",  dot: "bg-brand-600" },
  graded:    { label: "Noté",       color: "text-brand-600",  dot: "bg-brand-600" },
  returned:  { label: "À corriger", color: "text-saffron-500", dot: "bg-saffron-500" },
  rejected:  { label: "Refusé",     color: "text-coral-500",  dot: "bg-coral-500" },
  late:      { label: "En retard",  color: "text-coral-500",  dot: "bg-coral-500" }
};

function StudentRow({ student, index }: { student: SpaceStudent; index: number }) {
  const sub = student.submission;
  const hasSubmitted = Boolean(sub);
  const meta = sub ? STATUS_META[sub.status] : null;

  return (
    <div className={cn(
      "grid grid-cols-[32px_1fr_auto] items-center gap-3 px-4 py-3 transition hover:bg-slate-50",
      index > 0 && "border-t border-line"
    )}>
      {/* Numéro + indicateur */}
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
        hasSubmitted ? "bg-brand-50 text-brand-600" : "bg-slate-100 text-muted"
      )}>
        {hasSubmitted ? (
          <CheckCircle2 className="h-4 w-4 text-brand-600" />
        ) : (
          <Clock className="h-4 w-4 text-muted" />
        )}
      </div>

      {/* Infos étudiant */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{student.fullName}</span>
          {student.studentNumber && (
            <span className="text-xs text-muted">{student.studentNumber}</span>
          )}
          {sub?.isLate && (
            <span className="rounded-full bg-coral-50 px-2 py-0.5 text-[10px] font-bold text-coral-500">
              Retard
            </span>
          )}
        </div>
        {sub ? (
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
            <span className="truncate max-w-[200px]">{sub.fileName}</span>
            <span>·</span>
            <span>{sub.sizeMb} Mo</span>
            <span>·</span>
            <span>{sub.submittedAt}</span>
          </div>
        ) : (
          <p className="mt-0.5 text-xs text-muted italic">Pas encore rendu</p>
        )}
      </div>

      {/* Statut + actions */}
      <div className="flex shrink-0 items-center gap-2">
        {sub ? (
          <>
            {sub.grade && (
              <span className="text-base font-bold text-brand-600">{sub.grade}</span>
            )}
            <span className={cn("flex items-center gap-1.5 text-xs font-semibold", meta?.color)}>
              <span className={cn("h-2 w-2 rounded-full", meta?.dot)} />
              {meta?.label}
            </span>
            <Link
              href={`/submissions/${sub.id}`}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-xs font-semibold text-muted transition hover:text-ink"
            >
              Évaluer →
            </Link>
          </>
        ) : (
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-muted">
            En attente
          </span>
        )}
      </div>
    </div>
  );
}

export default async function SpaceTrackingPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tracking = await getSpaceTracking(id);

  if (!tracking) notFound();

  const pct = tracking.totalExpected > 0
    ? Math.round((tracking.totalSubmitted / tracking.totalExpected) * 100)
    : 0;

  const submitted = tracking.students.filter((s) => s.submission);
  const missing   = tracking.students.filter((s) => !s.submission);
  const toReview  = submitted.filter((s) =>
    s.submission && ["received", "read", "late"].includes(s.submission.status)
  );

  return (
    <AppShell active="Professeur">
      <Link
        href="/teacher"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      {/* En-tête espace */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-muted">
              {tracking.spaceType}
            </span>
            {tracking.subject && (
              <span className="text-xs text-muted">{tracking.subject}</span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold text-ink">{tracking.spaceTitle}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" />
              Deadline : {tracking.deadline}
            </span>
            {tracking.classes.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {tracking.classes.join(", ")}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/spaces/${id}/export`}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-muted transition hover:text-ink"
          >
            <TableProperties className="h-4 w-4" />
            Exporter CSV
          </a>
        </div>
      </div>

      {/* Statistiques */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Rendus"
          value={`${tracking.totalSubmitted} / ${tracking.totalExpected}`}
          sub={`${pct}% de la classe`}
          color="brand"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          label="À évaluer"
          value={String(toReview.length)}
          sub="En attente de correction"
          color="lagoon"
          icon={<Download className="h-5 w-5" />}
        />
        <StatCard
          label="Retards"
          value={String(tracking.totalLate)}
          sub="Dépôts après deadline"
          color="coral"
          icon={<RotateCcw className="h-5 w-5" />}
        />
        <StatCard
          label="Manquants"
          value={String(missing.length)}
          sub="N'ont pas encore rendu"
          color="slate"
          icon={<FileX2 className="h-5 w-5" />}
        />
      </div>

      {/* Barre de progression globale */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-line bg-white p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-bold text-ink">Progression de la classe</span>
          <span className="font-bold text-brand-600">{pct}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          {tracking.totalSubmitted} rendu{tracking.totalSubmitted > 1 ? "s" : ""} sur {tracking.totalExpected} attendu{tracking.totalExpected > 1 ? "s" : ""}
          {tracking.totalLate > 0 && ` · ${tracking.totalLate} en retard`}
        </p>
      </div>

      {/* Liste des étudiants */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {/* À évaluer en premier */}
        {toReview.length > 0 && (
          <section>
            <div className="flex items-center gap-2 border-b border-line bg-lagoon-50 px-4 py-2.5">
              <BadgeCheck className="h-4 w-4 text-lagoon-500" />
              <h2 className="text-xs font-bold uppercase tracking-wide text-lagoon-500">
                À évaluer ({toReview.length})
              </h2>
            </div>
            {toReview.map((s, i) => (
              <StudentRow key={s.id} student={s} index={i} />
            ))}
          </section>
        )}

        {/* Rendus + évalués */}
        {submitted.filter((s) => s.submission && !["received", "read", "late"].includes(s.submission.status)).length > 0 && (
          <section>
            <div className="flex items-center gap-2 border-b border-line bg-brand-50 px-4 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
              <h2 className="text-xs font-bold uppercase tracking-wide text-brand-600">
                Évalués ({submitted.filter((s) => s.submission && !["received", "read", "late"].includes(s.submission.status)).length})
              </h2>
            </div>
            {submitted
              .filter((s) => s.submission && !["received", "read", "late"].includes(s.submission.status))
              .map((s, i) => (
                <StudentRow key={s.id} student={s} index={i} />
              ))}
          </section>
        )}

        {/* Pas encore rendus */}
        {missing.length > 0 && (
          <section>
            <div className="flex items-center gap-2 border-b border-line bg-slate-50 px-4 py-2.5">
              <Clock className="h-4 w-4 text-muted" />
              <h2 className="text-xs font-bold uppercase tracking-wide text-muted">
                Pas encore rendu ({missing.length})
              </h2>
            </div>
            {missing.map((s, i) => (
              <StudentRow key={s.id} student={s} index={i} />
            ))}
          </section>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({
  label, value, sub, color, icon
}: {
  label: string;
  value: string;
  sub: string;
  color: "brand" | "lagoon" | "coral" | "slate";
  icon: React.ReactNode;
}) {
  const colors = {
    brand: "bg-brand-50 text-brand-600",
    lagoon: "bg-lagoon-50 text-lagoon-500",
    coral: "bg-coral-50 text-coral-500",
    slate: "bg-slate-100 text-muted"
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", colors[color])}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-ink">{value}</p>
        <p className="text-xs font-semibold text-muted">{label}</p>
        <p className="text-[10px] text-muted">{sub}</p>
      </div>
    </div>
  );
}
