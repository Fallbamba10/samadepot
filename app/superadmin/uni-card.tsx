"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Database, Loader2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type UniversityRow = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  is_active: boolean;
  max_storage_gb: number;
  used_storage_mb: number;
  totalStudents: number;
  totalTeachers: number;
  totalSubmissions: number;
};

const PLAN_META: Record<string, { label: string; color: string }> = {
  free:     { label: "Gratuit",  color: "bg-slate-100 text-muted" },
  basic:    { label: "Basic",    color: "bg-saffron-50 text-saffron-500" },
  standard: { label: "Standard", color: "bg-lagoon-50 text-lagoon-500" },
  premium:  { label: "Premium",  color: "bg-brand-50 text-brand-600" }
};

const PLANS = ["free", "basic", "premium"] as const;

function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 py-2">
      <p className="text-base font-bold text-ink">{value}</p>
      <p className="text-[10px] text-muted">{label}</p>
    </div>
  );
}

export function UniCard({ uni, onDeleted }: { uni: UniversityRow; onDeleted: (id: string) => void }) {
  const [currentPlan, setCurrentPlan] = useState(uni.plan);
  const [isActive, setIsActive] = useState(uni.is_active);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [patching, setPatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = PLAN_META[currentPlan] ?? PLAN_META.free;
  const storagePct = uni.max_storage_gb > 0
    ? Math.min(100, Math.round((uni.used_storage_mb / (uni.max_storage_gb * 1024)) * 100))
    : 0;
  const storageUsed = uni.used_storage_mb >= 1024
    ? `${(uni.used_storage_mb / 1024).toFixed(1)} Go`
    : `${uni.used_storage_mb} Mo`;

  async function patch(body: Record<string, unknown>) {
    setPatching(true);
    setError(null);
    const res = await fetch(`/api/superadmin/universities/${uni.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setPatching(false);
    if (!res.ok) { setError(json.error ?? "Erreur"); return false; }
    return true;
  }

  async function handlePlanChange(newPlan: string) {
    if (newPlan === currentPlan) return;
    const ok = await patch({ plan: newPlan });
    if (ok) setCurrentPlan(newPlan);
  }

  async function handleToggleActive() {
    const ok = await patch({ is_active: !isActive });
    if (ok) setIsActive(!isActive);
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/superadmin/universities/${uni.id}/delete`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erreur"); setDeleting(false); return; }
      onDeleted(uni.id);
    } catch {
      setError("Erreur réseau");
      setDeleting(false);
    }
  }

  return (
    <>
      <div className={cn(
        "flex flex-col rounded-2xl border bg-white p-5 transition hover:shadow-soft",
        isActive ? "border-line" : "border-line opacity-60"
      )}>
        {/* En-tête */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-600">
            {uni.slug.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", plan.color)}>
              {plan.label}
            </span>
            {!isActive && (
              <span className="rounded-full bg-coral-50 px-2.5 py-1 text-[10px] font-bold text-coral-500">
                Suspendu
              </span>
            )}
          </div>
        </div>

        <h3 className="mt-3 text-sm font-bold leading-snug text-ink">{uni.name}</h3>
        <p className="text-xs text-muted">{uni.slug}</p>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <StatMini label="Étudiants" value={uni.totalStudents} />
          <StatMini label="Profs" value={uni.totalTeachers} />
          <StatMini label="Dépôts" value={uni.totalSubmissions} />
        </div>

        {/* Stockage */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Stockage
            </span>
            <span>{storageUsed} / {uni.max_storage_gb} Go · {storagePct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full transition-all",
                storagePct > 90 ? "bg-coral-500" : storagePct > 70 ? "bg-saffron-500" : "bg-brand-600"
              )}
              style={{ width: `${storagePct}%` }}
            />
          </div>
        </div>

        {/* Changer le plan */}
        <div className="mt-4">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted">Plan</p>
          <div className="flex gap-1.5">
            {PLANS.map((p) => (
              <button
                key={p}
                onClick={() => handlePlanChange(p)}
                disabled={patching}
                className={cn(
                  "flex-1 rounded-lg border py-1.5 text-[11px] font-bold transition",
                  currentPlan === p
                    ? "border-brand-500 bg-brand-50 text-brand-600"
                    : "border-line bg-white text-muted hover:border-brand-300 hover:text-ink"
                )}
              >
                {PLAN_META[p]?.label ?? p}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mt-2 text-[11px] text-coral-500">{error}</p>}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/admin?uni=${uni.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line bg-white py-2 text-xs font-semibold text-muted transition hover:text-ink"
          >
            Gérer
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={handleToggleActive}
            disabled={patching}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition",
              isActive
                ? "border-saffron-200 text-saffron-500 hover:bg-saffron-50"
                : "border-brand-200 text-brand-500 hover:bg-brand-50"
            )}
            title={isActive ? "Suspendre" : "Réactiver"}
          >
            {patching ? <Loader2 className="h-4 w-4 animate-spin" /> : isActive ? "⏸" : "▶"}
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-coral-200 text-coral-400 transition hover:bg-coral-50 hover:text-coral-500"
            title="Supprimer l'université"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modal de confirmation suppression */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-sm font-bold text-ink">Supprimer l'université</h2>
              <button onClick={() => { setShowConfirm(false); setConfirmName(""); setError(null); }} className="text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="rounded-xl bg-coral-50 border border-coral-100 px-4 py-3 text-sm text-coral-600">
                <p className="font-bold mb-1">Action irréversible</p>
                <p className="text-xs">Tous les utilisateurs, espaces de dépôt et fichiers de <strong>{uni.name}</strong> seront définitivement supprimés.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink">
                  Tape <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-coral-600">{uni.name}</span> pour confirmer
                </label>
                <input
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={uni.name}
                  className="h-11 w-full rounded-xl border border-line px-3 text-sm focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20"
                />
              </div>
              {error && <p className="text-xs text-coral-500">{error}</p>}
            </div>
            <div className="flex gap-3 border-t border-line px-5 py-4">
              <button
                onClick={() => { setShowConfirm(false); setConfirmName(""); setError(null); }}
                className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-muted hover:text-ink"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmName !== uni.name || deleting}
                className="flex-1 rounded-xl bg-coral-500 py-2.5 text-sm font-semibold text-white transition hover:bg-coral-600 disabled:opacity-40"
              >
                {deleting
                  ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Suppression…</span>
                  : "Supprimer définitivement"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
