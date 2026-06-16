"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { SpaceCard } from "@/components/space-card";
import type { SubmissionSpace } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  devoir: "Devoir",
  examen: "Examen",
  tp: "TP",
  rapport_stage: "Stage",
  pfe: "PFE",
  memoire: "Mémoire",
  expose: "Exposé",
  autre: "Autre"
};

const STATUS_LABELS: Record<string, string> = {
  open: "Ouvert",
  soon: "Bientôt",
  urgent: "Urgent"
};

export function SpacesClient({ spaces, role = "student" }: { spaces: SubmissionSpace[]; role?: string }) {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const types = useMemo(() => {
    const seen = new Set<string>();
    spaces.forEach((s) => seen.add(s.type));
    return [...seen];
  }, [spaces]);

  const filtered = useMemo(() => {
    return spaces.filter((s) => {
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.teacher.toLowerCase().includes(q) ||
        (s.subject ?? "").toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q);
      const matchType = !filterType || s.type === filterType;
      const matchStatus = !filterStatus || s.status === filterStatus;
      return matchQuery && matchType && matchStatus;
    });
  }, [spaces, query, filterType, filterStatus]);

  const open = filtered.filter((s) => s.status !== "expired");
  const expired = filtered.filter((s) => s.status === "expired");
  const hasFilters = query || filterType || filterStatus;

  function clearFilters() {
    setQuery("");
    setFilterType("");
    setFilterStatus("");
  }

  return (
    <div>
      {/* Barre de recherche + filtres */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un espace, un prof, une matière..."
            className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-sm transition placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-brand-500 focus:outline-none"
          >
            <option value="">Tous types</option>
            {types.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-brand-500 focus:outline-none"
          >
            <option value="">Tous statuts</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex h-11 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-muted hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
          <p className="text-sm font-bold text-ink">Aucun espace trouvé</p>
          <p className="mt-1 text-sm text-muted">Essaie d'autres mots-clés ou réinitialise les filtres.</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 text-sm font-semibold text-brand-600 hover:underline">
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {open.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-bold text-ink">Espaces ouverts</h2>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600">
                  {open.length}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {open.map((space) => (
                  <SpaceCard key={space.id} space={space} mode={role === "teacher" || role === "admin" || role === "superadmin" ? "teacher" : "student"} />
                ))}
              </div>
            </section>
          )}

          {expired.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-bold text-muted">Espaces fermés</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-muted">
                  {expired.length}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {expired.map((space) => (
                  <SpaceCard key={space.id} space={space} mode={role === "teacher" || role === "admin" || role === "superadmin" ? "teacher" : "student"} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
