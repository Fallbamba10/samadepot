"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditLog } from "@/lib/data";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  UPDATE_USER:         { label: "Modif. utilisateur",  color: "bg-saffron-50 text-saffron-600" },
  DELETE_USER:         { label: "Suppression user",    color: "bg-coral-50 text-coral-600" },
  CREATE_USER:         { label: "Création user",       color: "bg-brand-50 text-brand-600" },
  REVIEW_SUBMISSION:   { label: "Évaluation dépôt",    color: "bg-lagoon-50 text-lagoon-600" },
  SUBMIT_FILE:         { label: "Dépôt fichier",       color: "bg-brand-50 text-brand-600" },
  CREATE_SPACE:        { label: "Création espace",     color: "bg-brand-50 text-brand-600" },
  CLOSE_SPACE:         { label: "Clôture espace",      color: "bg-slate-100 text-slate-500" },
};

function ActionBadge({ action }: { action: string }) {
  const meta = ACTION_LABELS[action] ?? { label: action.replace(/_/g, " "), color: "bg-slate-100 text-slate-500" };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", meta.color)}>
      {meta.label}
    </span>
  );
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `Il y a ${d}j`;
}

export function AuditLogsSection({ logs }: { logs: AuditLog[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? logs : logs.slice(0, 8);

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white p-8 text-center text-sm text-muted">
        Aucune action enregistrée pour le moment.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white overflow-hidden">
      <div className="divide-y divide-line">
        {visible.map((log) => (
          <div key={log.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-muted">
              <Shield className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <ActionBadge action={log.action} />
                <span className="text-xs font-semibold text-ink truncate">{log.actorName}</span>
                {log.actorEmail && (
                  <span className="text-xs text-muted truncate">{log.actorEmail}</span>
                )}
              </div>
              {log.resourceType && (
                <p className="mt-0.5 text-[11px] text-muted">
                  {log.resourceType}{log.resourceId ? ` · ${log.resourceId.slice(0, 8)}…` : ""}
                </p>
              )}
            </div>
            <span className="shrink-0 text-[11px] text-muted whitespace-nowrap">
              {formatRelative(log.createdAt)}
            </span>
          </div>
        ))}
      </div>

      {logs.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-line py-3 text-xs font-semibold text-muted hover:text-ink transition"
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" /> Réduire</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" /> Voir les {logs.length - 8} entrées restantes</>
          )}
        </button>
      )}
    </div>
  );
}
