"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  BellRing,
  CheckCheck,
  Clock,
  FileCheck2,
  GraduationCap,
  RotateCcw,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types";

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

const TYPE_META: Record<NotificationType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  submission_graded:    { icon: GraduationCap, color: "text-brand-600",   bg: "bg-brand-50",    label: "Note reçue" },
  submission_returned:  { icon: RotateCcw,     color: "text-saffron-500", bg: "bg-saffron-50",  label: "Correction demandée" },
  submission_validated: { icon: FileCheck2,    color: "text-brand-600",   bg: "bg-brand-50",    label: "Validé" },
  submission_rejected:  { icon: X,             color: "text-coral-500",   bg: "bg-coral-50",    label: "Refusé" },
  submission_received:  { icon: FileCheck2,    color: "text-lagoon-500",  bg: "bg-lagoon-50",   label: "Reçu" },
  submission_late:      { icon: Clock,         color: "text-coral-500",   bg: "bg-coral-50",    label: "En retard" },
  space_opened:         { icon: BellRing,      color: "text-lagoon-500",  bg: "bg-lagoon-50",   label: "Nouvel espace" },
  deadline_reminder:    { icon: Clock,         color: "text-saffron-500", bg: "bg-saffron-50",  label: "Rappel deadline" },
};

export function NotificationsClient({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unread = notifications.filter((n) => !n.isRead);
  const displayed = filter === "unread" ? unread : notifications;

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
  }

  async function markAllRead() {
    const ids = unread.map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (ids.length > 0) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    }
  }

  // Grouper par jour
  function groupByDay(notifs: Notification[]) {
    const map: Map<string, Notification[]> = new Map();
    for (const n of notifs) {
      const day = new Date(n.createdAt).toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long"
      });
      const cap = day.charAt(0).toUpperCase() + day.slice(1);
      if (!map.has(cap)) map.set(cap, []);
      map.get(cap)!.push(n);
    }
    return map;
  }

  const grouped = groupByDay(displayed);

  return (
    <div>
      {/* Filtres + action */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex rounded-xl border border-line bg-white p-1">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-xs font-semibold transition",
                filter === f ? "bg-brand-600 text-white" : "text-muted hover:text-ink"
              )}
            >
              {f === "all" ? "Toutes" : `Non lues${unread.length > 0 ? ` (${unread.length})` : ""}`}
            </button>
          ))}
        </div>
        {unread.length > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Liste groupée par jour */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-white py-20 text-center">
          <Bell className="h-10 w-10 text-muted opacity-20" />
          <p className="text-sm font-semibold text-muted">
            {filter === "unread" ? "Aucune notification non lue" : "Aucune notification"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([day, notifs]) => (
            <section key={day}>
              <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-muted">{day}</p>
              <div className="overflow-hidden rounded-2xl border border-line bg-white divide-y divide-line">
                {notifs.map((n) => {
                  const meta = TYPE_META[n.type];
                  const Icon = meta.icon;
                  return (
                    <Link
                      key={n.id}
                      href={(n.link ?? "/notifications") as any}
                      onClick={() => { if (!n.isRead) markRead(n.id); }}
                      className={cn(
                        "flex gap-4 px-5 py-4 transition hover:bg-slate-50",
                        !n.isRead && "bg-brand-50/30"
                      )}
                    >
                      <div className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", meta.bg)}>
                        <Icon className={cn("h-5 w-5", meta.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold",
                              meta.bg, meta.color
                            )}>
                              {meta.label}
                            </span>
                            <p className={cn(
                              "mt-1 text-sm leading-snug",
                              n.isRead ? "font-medium text-ink" : "font-bold text-ink"
                            )}>
                              {n.title}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-[10px] text-muted whitespace-nowrap">
                              {relativeTime(n.createdAt)}
                            </span>
                            {!n.isRead && (
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />
                            )}
                          </div>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted">{n.body}</p>
                        {n.meta?.grade && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1">
                            <GraduationCap className="h-3.5 w-3.5 text-brand-600" />
                            <span className="text-sm font-bold text-brand-600">{n.meta.grade}</span>
                          </div>
                        )}
                        {n.meta?.deadline && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-saffron-50 px-3 py-1">
                            <Clock className="h-3.5 w-3.5 text-saffron-500" />
                            <span className="text-xs font-semibold text-saffron-500">{n.meta.deadline}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
