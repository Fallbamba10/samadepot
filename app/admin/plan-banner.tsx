"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Zap } from "lucide-react";
import { getPlanLimits } from "@/lib/plans";
import type { AdminOverview } from "@/types";

function UsageBar({ used, max, label }: { used: number; max: number; label: string }) {
  const isUnlimited = max >= 99_999;
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / max) * 100));
  const isNearLimit = pct >= 80;
  const color = isNearLimit ? "bg-coral-500" : "bg-brand-500";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="font-semibold text-ink">{label}</span>
        <span className={`font-bold ${isNearLimit ? "text-coral-500" : "text-muted"}`}>
          {isUnlimited ? `${used} / ∞` : `${used} / ${max}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

const NEXT_PLAN: Record<string, "basic" | "premium"> = {
  free: "basic",
  basic: "premium",
};

const NEXT_PLAN_LABEL: Record<string, string> = {
  free: "Passer au plan Basic — 15 000 FCFA/mois",
  basic: "Passer au plan Premium — 35 000 FCFA/mois",
};

export function PlanBanner({ overview }: { overview: AdminOverview }) {
  const limits = getPlanLimits(overview.plan);
  const storageUsedGb = overview.usedStorageMb / 1024;
  const storagePct = Math.min(100, Math.round((storageUsedGb / limits.maxStorageGb) * 100));
  const isNearLimit =
    overview.totalTeachers / limits.maxTeachers >= 0.8 ||
    overview.totalStudents / limits.maxStudents >= 0.8 ||
    storagePct >= 80;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPlan = NEXT_PLAN[overview.plan];

  async function handleUpgrade() {
    if (!nextPlan) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/payment/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: nextPlan }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      setLoading(false);
      return;
    }

    const { redirectUrl } = await res.json();
    window.location.href = redirectUrl;
  }

  const planColors: Record<string, string> = {
    free:    "border-slate-200 bg-slate-50",
    basic:   "border-brand-100 bg-brand-50",
    premium: "border-saffron-50 bg-saffron-50",
  };

  return (
    <div className={`mb-6 overflow-hidden rounded-2xl border ${planColors[overview.plan] ?? planColors.free}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-brand-600" />
          <span className="text-sm font-bold text-ink">Plan {limits.label}</span>
          {isNearLimit && (
            <span className="rounded-full bg-coral-100 px-2 py-0.5 text-[10px] font-bold text-coral-600">
              Proche de la limite
            </span>
          )}
        </div>
        {nextPlan && (
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            {loading
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <ArrowRight className="h-3 w-3" />
            }
            {loading ? "Redirection…" : NEXT_PLAN_LABEL[overview.plan]}
          </button>
        )}
      </div>

      <div className="grid gap-3 border-t border-current/10 px-5 py-4 sm:grid-cols-3">
        <UsageBar used={overview.totalTeachers} max={limits.maxTeachers} label="Professeurs" />
        <UsageBar used={overview.totalStudents} max={limits.maxStudents} label="Étudiants" />
        <UsageBar
          used={Math.round(storageUsedGb * 10) / 10}
          max={limits.maxStorageGb}
          label="Stockage (Go)"
        />
      </div>

      {error && (
        <div className="border-t border-current/10 px-5 py-3 text-xs font-semibold text-coral-500">
          {error}
        </div>
      )}
    </div>
  );
}
