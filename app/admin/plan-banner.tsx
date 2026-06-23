import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { getPlanLimits } from "@/lib/plans";
import type { AdminOverview } from "@/types";

function UsageBar({ used, max, label }: { used: number; max: number; label: string }) {
  const pct = max >= 99_999 ? 0 : Math.min(100, Math.round((used / max) * 100));
  const isUnlimited = max >= 99_999;
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

export function PlanBanner({ overview }: { overview: AdminOverview }) {
  const limits = getPlanLimits(overview.plan);
  const storageUsedGb = overview.usedStorageMb / 1024;
  const storagePct = Math.min(100, Math.round((storageUsedGb / limits.maxStorageGb) * 100));
  const isNearLimit =
    overview.totalTeachers / limits.maxTeachers >= 0.8 ||
    overview.totalStudents / limits.maxStudents >= 0.8 ||
    storagePct >= 80;

  const planColors: Record<string, string> = {
    free: "border-slate-200 bg-slate-50",
    basic: "border-brand-100 bg-brand-50",
    standard: "border-lagoon-100 bg-lagoon-50",
    premium: "border-saffron-100 bg-saffron-50",
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
        {overview.plan !== "premium" && (
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-500"
          >
            Passer au plan supérieur
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="grid gap-3 border-t border-current/10 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
        <UsageBar used={overview.totalTeachers} max={limits.maxTeachers} label="Professeurs" />
        <UsageBar used={overview.totalStudents} max={limits.maxStudents} label="Étudiants" />
        <UsageBar used={overview.totalSpaces} max={limits.maxSpaces} label="Espaces actifs" />
        <UsageBar
          used={Math.round(storageUsedGb * 10) / 10}
          max={limits.maxStorageGb}
          label={`Stockage (Go)`}
        />
      </div>
    </div>
  );
}
