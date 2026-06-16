"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Check, Download, ReceiptText, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Submission } from "@/types";

type Decision = "validate" | "grade" | "return" | "reject";

const decisionLabels: Record<Decision, string> = {
  validate: "Valider",
  grade: "Noter",
  return: "Retourner",
  reject: "Rejeter"
};

export function ReviewForm({ submission }: { submission: Submission }) {
  const router = useRouter();
  const [decision, setDecision] = useState<Decision>("validate");
  const [grade, setGrade] = useState(submission.grade?.split("/")[0] ?? "");
  const [comment, setComment] = useState(submission.reviewComment ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitReview(nextDecision: Decision) {
    setDecision(nextDecision);
    setError(null);

    if (nextDecision === "grade" && grade.trim().length === 0) {
      setError("Ajoute une note avant de confirmer.");
      return;
    }

    setIsLoading(true);
    const response = await fetch(`/api/submissions/${submission.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision: nextDecision,
        grade: nextDecision === "grade" ? Number(grade) : undefined,
        comment: comment.trim() || undefined
      })
    });
    const json = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError(json.error ?? "Evaluation impossible");
      return;
    }

    router.refresh();
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-lg border border-line bg-white p-4 shadow-line">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              Depot selectionne
            </div>
            <h2 className="mt-3 text-lg font-bold text-ink">
              {submission.student}
            </h2>
            <p className="mt-1 text-sm text-muted">{submission.spaceTitle}</p>
          </div>
          <StatusBadge status={submission.status} />
        </div>

        <div className="mt-5 rounded-md bg-slate-50 p-3">
          <div className="text-sm font-semibold text-ink">
            {submission.fileName}
          </div>
          <div className="mt-1 text-xs text-muted">
            {submission.sizeMb} Mo · {submission.hash.slice(0, 16)}
          </div>
          <div className="mt-1 text-xs text-muted">
            Depot: {submission.submittedAt}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={`/api/submissions/${submission.id}/download`}
            className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Telecharger
          </Link>
          <Link
            href={`/submissions/${submission.id}`}
            className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50"
          >
            <ReceiptText className="h-4 w-4" />
            Recepisse
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white p-4 shadow-line">
        <div className="grid gap-4 md:grid-cols-[1fr_160px]">
          <label className="block">
            <span className="text-sm font-semibold text-ink">
              Commentaire visible par l'etudiant
            </span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="focus-ring mt-2 min-h-36 w-full resize-none rounded-md border border-line bg-white p-3 text-sm text-ink placeholder:text-muted"
              placeholder="Ex: Travail bien structure, corriger la partie methodologie avant validation finale."
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink">Note /20</span>
            <input
              type="number"
              min="0"
              max="20"
              step="0.25"
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
              className="focus-ring mt-2 h-10 w-full rounded-md border border-line px-3 text-sm"
              placeholder="16"
            />
            <p className="mt-2 text-xs text-muted">
              Utilisee uniquement avec l'action Noter.
            </p>
          </label>
        </div>

        {error ? (
          <div className="mt-4 flex gap-2 rounded-md bg-coral-50 px-3 py-2 text-sm text-coral-500">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          <Button
            type="button"
            disabled={isLoading}
            onClick={() => submitReview("validate")}
          >
            <Check className="h-4 w-4" />
            {isLoading && decision === "validate" ? "..." : decisionLabels.validate}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isLoading}
            onClick={() => submitReview("grade")}
          >
            {isLoading && decision === "grade" ? "..." : decisionLabels.grade}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isLoading}
            onClick={() => submitReview("return")}
          >
            <RotateCcw className="h-4 w-4" />
            {isLoading && decision === "return" ? "..." : decisionLabels.return}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isLoading}
            onClick={() => submitReview("reject")}
          >
            <X className="h-4 w-4" />
            {isLoading && decision === "reject" ? "..." : decisionLabels.reject}
          </Button>
        </div>
      </div>
    </section>
  );
}
