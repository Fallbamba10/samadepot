"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, Circle, Rocket, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  title: string;
  description: string;
  href?: string;
  hrefLabel?: string;
  anchor?: string;
  done: boolean;
};

export function OnboardingBanner({
  hasClasses,
  hasUsers,
  hasSpaces,
}: {
  hasClasses: boolean;
  hasUsers: boolean;
  hasSpaces: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);

  const steps: Step[] = [
    {
      id: "classes",
      title: "Créer tes premières classes",
      description: "Ajoute les filières et niveaux de ton établissement (L1, L2, M1…)",
      anchor: "#config",
      hrefLabel: "Aller à la configuration →",
      done: hasClasses,
    },
    {
      id: "users",
      title: "Ajouter des étudiants et professeurs",
      description: "Crée les comptes manuellement ou importe un fichier CSV.",
      anchor: "#config",
      hrefLabel: "Créer des comptes →",
      done: hasUsers,
    },
    {
      id: "spaces",
      title: "Attendre qu'un prof ouvre un espace",
      description: "Les professeurs créent les espaces de dépôt. Tu peux aussi en créer toi-même.",
      done: hasSpaces,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  if (dismissed || allDone) return null;

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white shadow-soft">
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">Bienvenue sur SamaDepot !</h2>
            <p className="text-xs text-muted">
              {doneCount}/{steps.length} étapes complétées — suis ce guide pour configurer ta plateforme
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-slate-100 hover:text-ink"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Barre de progression */}
      <div className="mx-5 mt-3 h-1.5 overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-500"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="divide-y divide-brand-100 p-5 pt-4">
        {steps.map((step) => (
          <div key={step.id} className={cn("flex items-start gap-3 py-3 first:pt-0 last:pb-0")}>
            {step.done
              ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-brand-200" />
            }
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-semibold", step.done ? "text-muted line-through" : "text-ink")}>
                {step.title}
              </p>
              <p className="mt-0.5 text-xs text-muted">{step.description}</p>
            </div>
            {!step.done && step.anchor && (
              <a
                href={step.anchor}
                className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
              >
                {step.hrefLabel ?? "Commencer"}
                <ChevronRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
