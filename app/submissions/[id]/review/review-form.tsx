"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, MessageSquare, RotateCcw, Star, XCircle } from "lucide-react";

type Decision = "validate" | "grade" | "return" | "reject";

const DECISIONS: { value: Decision; label: string; description: string; color: string; icon: React.ReactNode }[] = [
  {
    value: "grade",
    label: "Noter",
    description: "Attribuer une note sur 20",
    color: "border-brand-300 bg-brand-50 text-brand-700",
    icon: <Star className="h-4 w-4" />,
  },
  {
    value: "validate",
    label: "Valider",
    description: "Accepter sans note",
    color: "border-lagoon-300 bg-lagoon-50 text-lagoon-700",
    icon: <BadgeCheck className="h-4 w-4" />,
  },
  {
    value: "return",
    label: "Retourner",
    description: "Demander des corrections",
    color: "border-saffron-300 bg-saffron-50 text-saffron-700",
    icon: <RotateCcw className="h-4 w-4" />,
  },
  {
    value: "reject",
    label: "Rejeter",
    description: "Refuser le dépôt",
    color: "border-coral-300 bg-coral-50 text-coral-700",
    icon: <XCircle className="h-4 w-4" />,
  },
];

export function ReviewForm({
  submissionId,
  currentGrade,
  currentComment,
}: {
  submissionId: string;
  currentGrade?: string;
  currentComment?: string;
}) {
  const router = useRouter();
  const [decision, setDecision] = useState<Decision>("validate");
  const [grade, setGrade] = useState<string>("");
  const [comment, setComment] = useState(currentComment ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (decision === "grade" && (grade === "" || Number(grade) < 0 || Number(grade) > 20)) {
      setError("La note doit être entre 0 et 20.");
      return;
    }
    setError(null);
    setIsLoading(true);

    const res = await fetch(`/api/submissions/${submissionId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision,
        grade: decision === "grade" ? Number(grade) : undefined,
        comment: comment.trim() || undefined,
      }),
    });

    const json = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setError(json.error ?? "Erreur lors de l'évaluation.");
      return;
    }

    router.push(`/submissions/${submissionId}`);
    router.refresh();
  }

  const gradeNum = Number(grade);
  const gradeValid = grade !== "" && gradeNum >= 0 && gradeNum <= 20;

  return (
    <div className="space-y-6 rounded-2xl border border-line bg-white p-6 shadow-line">
      {/* Décision */}
      <div>
        <p className="mb-3 text-sm font-bold text-ink">Décision</p>
        <div className="grid grid-cols-2 gap-2">
          {DECISIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDecision(d.value)}
              className={`flex items-start gap-2 rounded-xl border-2 p-3 text-left transition ${
                decision === d.value ? d.color + " border-current" : "border-line hover:border-slate-300"
              }`}
            >
              <span className="mt-0.5 shrink-0">{d.icon}</span>
              <div>
                <p className="text-sm font-bold">{d.label}</p>
                <p className="text-xs text-muted">{d.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      {decision === "grade" && (
        <div>
          <label className="mb-2 block text-sm font-bold text-ink">
            Note <span className="text-muted font-normal">(sur 20)</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={20}
              step={0.5}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="ex: 14"
              className="h-12 w-28 rounded-xl border border-line px-4 text-center text-xl font-bold text-ink focus:border-brand-400 focus:outline-none"
            />
            <span className="text-sm text-muted">/ 20</span>
            {gradeValid && (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-600">
                {gradeNum >= 16 ? "Très bien" : gradeNum >= 14 ? "Bien" : gradeNum >= 12 ? "Assez bien" : gradeNum >= 10 ? "Passable" : "Insuffisant"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Commentaire */}
      <div>
        <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink">
          <MessageSquare className="h-3.5 w-3.5" />
          Commentaire <span className="text-muted font-normal">(facultatif)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Remarques, feedback, points à améliorer..."
          className="w-full rounded-xl border border-line px-4 py-3 text-sm text-ink focus:border-brand-400 focus:outline-none resize-none"
        />
        <p className="mt-1 text-right text-xs text-muted">{comment.length}/2000</p>
      </div>

      {error && (
        <p className="rounded-lg bg-coral-50 px-4 py-2 text-sm text-coral-600">{error}</p>
      )}

      <button
        onClick={submit}
        disabled={isLoading || (decision === "grade" && !gradeValid)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-brand-500 disabled:opacity-50"
      >
        {isLoading ? "Envoi..." : "Enregistrer l'évaluation"}
      </button>
    </div>
  );
}
