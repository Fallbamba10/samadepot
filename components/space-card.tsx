import Link from "next/link";
import { CalendarClock, FileText, Upload } from "lucide-react";
import type { SubmissionSpace } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const deadlineBg = {
  open: "bg-brand-50",
  soon: "bg-saffron-50",
  urgent: "bg-coral-50",
  expired: "bg-slate-100"
};

const deadlineText = {
  open: "text-brand-600",
  soon: "text-saffron-500",
  urgent: "text-coral-500",
  expired: "text-muted"
};

const statusLabel = {
  open: "Ouvert",
  soon: "Ferme bientôt",
  urgent: "Urgent",
  expired: "Expiré"
};

export function SpaceCard({
  space,
  mode = "student"
}: {
  space: SubmissionSpace;
  mode?: "student" | "teacher";
}) {
  const isExpired = space.status === "expired";

  return (
    <article className={cn(
      "flex flex-col rounded-2xl border bg-white p-5 transition",
      isExpired ? "border-line opacity-70" : "border-line shadow-line hover:shadow-soft"
    )}>
      {/* Type + statut deadline */}
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
          {space.type}
        </span>
        <span className={cn(
          "rounded-full px-2.5 py-1 text-xs font-semibold",
          deadlineBg[space.status],
          deadlineText[space.status]
        )}>
          {statusLabel[space.status]}
        </span>
      </div>

      {/* Titre */}
      <h3 className="mt-3 text-base font-bold leading-snug text-ink">
        {space.title}
      </h3>
      <p className="mt-1 text-sm text-muted">
        {space.teacher}
        {space.subject ? ` · ${space.subject}` : ""}
      </p>

      {/* Deadline mise en avant */}
      <div className={cn(
        "mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold",
        deadlineBg[space.status],
        deadlineText[space.status]
      )}>
        <CalendarClock className="h-4 w-4 shrink-0" />
        {isExpired ? "Délai dépassé" : `Deadline : ${space.deadline}`}
      </div>

      {/* Formats */}
      <div className="mt-3 flex items-center gap-2 text-xs text-muted">
        <FileText className="h-3.5 w-3.5 shrink-0" />
        {space.formats.join(", ")} · max {space.maxSizeMb} Mo
      </div>

      {/* Bouton */}
      <div className="mt-5 flex gap-2">
        {mode === "teacher" ? (
          <>
            <Button className="flex-1">Voir dépôts</Button>
            <Button variant="secondary">Exporter</Button>
          </>
        ) : isExpired ? (
          <span className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-line bg-slate-50 text-sm font-semibold text-muted">
            Dépôt fermé
          </span>
        ) : (
          <Link
            href={`/spaces/${space.id}/submit`}
            className="focus-ring inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            <Upload className="h-4 w-4" />
            Déposer mon travail
          </Link>
        )}
      </div>
    </article>
  );
}
