"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  FileCheck2,
  Users,
  UserX
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminDashboard } from "@/types";

const STATUS_META = {
  open:    { label: "Ouvert",   cls: "bg-brand-50 text-brand-600" },
  soon:    { label: "Bientôt",  cls: "bg-saffron-50 text-saffron-500" },
  urgent:  { label: "Urgent",   cls: "bg-coral-50 text-coral-500" },
  expired: { label: "Fermé",    cls: "bg-slate-100 text-muted" }
};

export function AdminDashboardSection({ data }: { data: AdminDashboard }) {
  const { activeSpaces, classStats, teachersWithoutSpace, recentSubmissions } = data;
  const hasData = activeSpaces.length > 0 || classStats.length > 0 || recentSubmissions.length > 0;

  if (!hasData) {
    return (
      <div className="mb-8 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
        <BookOpenCheck className="mx-auto h-10 w-10 text-brand-200" />
        <p className="mt-3 text-sm font-semibold text-ink">Aucune activité pour l'instant</p>
        <p className="mt-1 text-xs text-muted">
          Dès que vos professeurs créent des espaces de dépôt, les statistiques apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-6">

      {/* Alerte profs sans espace */}
      {teachersWithoutSpace.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-saffron-200 bg-saffron-50 px-5 py-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-saffron-500" />
          <div>
            <p className="text-sm font-bold text-saffron-600">
              {teachersWithoutSpace.length} professeur{teachersWithoutSpace.length > 1 ? "s" : ""} sans espace actif
            </p>
            <p className="mt-0.5 text-xs text-saffron-500">
              {teachersWithoutSpace.slice(0, 3).map(t => t.fullName).join(", ")}
              {teachersWithoutSpace.length > 3 && ` et ${teachersWithoutSpace.length - 3} autres`}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">

        {/* Espaces actifs */}
        {activeSpaces.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-bold text-ink">Espaces de dépôt actifs</h2>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600">
                {activeSpaces.length}
              </span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              {activeSpaces.map((space, i) => {
                const meta = STATUS_META[space.status];
                const pct = space.totalExpected > 0
                  ? Math.min(100, Math.round((space.totalSubmitted / space.totalExpected) * 100))
                  : null;
                return (
                  <div
                    key={space.id}
                    className={cn(
                      "flex items-center justify-between gap-3 px-4 py-3",
                      i > 0 && "border-t border-line"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold", meta.cls)}>
                          {meta.label}
                        </span>
                        <p className="truncate text-sm font-semibold text-ink">{space.title}</p>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {space.teacherName}
                        {space.classes.length > 0 && ` · ${space.classes.join(", ")}`}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-ink">
                        {space.totalSubmitted}
                        {pct !== null && <span className="ml-1 text-xs font-normal text-muted">{pct}%</span>}
                      </p>
                      <p className="text-[11px] text-muted">rendus</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Participation par classe */}
        {classStats.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-lagoon-500" />
              <h2 className="text-sm font-bold text-ink">Participation par classe</h2>
            </div>
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              {classStats.slice(0, 8).map((cls, i) => (
                <div
                  key={cls.id}
                  className={cn(
                    "px-4 py-3",
                    i > 0 && "border-t border-line"
                  )}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="truncate text-sm font-semibold text-ink">{cls.name}</span>
                      <span className="ml-2 text-xs text-muted">{cls.totalStudents} étudiant{cls.totalStudents > 1 ? "s" : ""}</span>
                    </div>
                    <span className={cn(
                      "shrink-0 text-xs font-bold",
                      cls.participationPct >= 75 ? "text-brand-600"
                      : cls.participationPct >= 40 ? "text-saffron-500"
                      : "text-coral-500"
                    )}>
                      {cls.participationPct}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        cls.participationPct >= 75 ? "bg-brand-600"
                        : cls.participationPct >= 40 ? "bg-saffron-500"
                        : "bg-coral-500"
                      )}
                      style={{ width: `${cls.participationPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Dépôts récents */}
      {recentSubmissions.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-bold text-ink">Dépôts récents</h2>
            </div>
            <Link
              href="/submissions"
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
            >
              Voir tous <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            {recentSubmissions.map((sub, i) => (
              <div
                key={sub.id}
                className={cn(
                  "flex items-center justify-between gap-3 px-4 py-3",
                  i > 0 && "border-t border-line"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{sub.studentName}</p>
                  <p className="truncate text-xs text-muted">{sub.spaceTitle}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {sub.isLate && (
                    <span className="rounded-full bg-coral-50 px-2 py-0.5 text-[10px] font-bold text-coral-500">
                      En retard
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Clock className="h-3 w-3" />
                    {sub.submittedAt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Profs sans espace — liste complète si peu nombreux */}
      {teachersWithoutSpace.length > 0 && teachersWithoutSpace.length <= 5 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <UserX className="h-4 w-4 text-muted" />
            <h2 className="text-sm font-bold text-ink">Professeurs sans espace actif</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            {teachersWithoutSpace.map((t, i) => (
              <div
                key={t.id}
                className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-line")}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-muted">
                  {t.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{t.fullName}</p>
                  <p className="text-xs text-muted">{t.email}</p>
                </div>
                <CheckCircle2 className="ml-auto h-4 w-4 text-slate-200" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
