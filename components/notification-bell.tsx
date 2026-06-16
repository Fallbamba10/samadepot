"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  if (days < 7) return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

const TYPE_META: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  submission_graded:    { icon: GraduationCap, color: "text-brand-600",   bg: "bg-brand-50" },
  submission_returned:  { icon: RotateCcw,     color: "text-saffron-500", bg: "bg-saffron-50" },
  submission_validated: { icon: FileCheck2,    color: "text-brand-600",   bg: "bg-brand-50" },
  submission_rejected:  { icon: X,             color: "text-coral-500",   bg: "bg-coral-50" },
  submission_received:  { icon: FileCheck2,    color: "text-lagoon-500",  bg: "bg-lagoon-50" },
  submission_late:      { icon: Clock,         color: "text-coral-500",   bg: "bg-coral-50" },
  space_opened:         { icon: BellRing,      color: "text-lagoon-500",  bg: "bg-lagoon-50" },
  deadline_reminder:    { icon: Clock,         color: "text-saffron-500", bg: "bg-saffron-50" },
};

function NotifItem({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) {
  const meta = TYPE_META[notif.type];
  const Icon = meta.icon;

  return (
    <Link
      href={(notif.link ?? "/notifications") as any}
      onClick={() => { if (!notif.isRead) onRead(notif.id); }}
      className={cn(
        "flex gap-3 px-4 py-3 transition hover:bg-slate-50",
        !notif.isRead && "bg-brand-50/40"
      )}
    >
      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", meta.bg)}>
        <Icon className={cn("h-4 w-4", meta.color)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-xs leading-snug", notif.isRead ? "font-medium text-ink" : "font-bold text-ink")}>
            {notif.title}
          </p>
          {!notif.isRead && (
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted">{notif.body}</p>
        <p className="mt-1 text-[10px] font-semibold text-muted">{relativeTime(notif.createdAt)}</p>
      </div>
    </Link>
  );
}

export function NotificationBell({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.isRead);
  const count = unread.length;

  // Ferme le dropdown en cliquant dehors
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-muted hover:text-ink"
      >
        {count > 0 ? <BellRing className="h-4 w-4 text-brand-600" /> : <Bell className="h-4 w-4" />}
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-ink" />
              <span className="text-sm font-bold text-ink">Notifications</span>
              {count > 0 && (
                <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </div>
            {count > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-600 hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tout lire
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-96 divide-y divide-line overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Bell className="h-8 w-8 text-muted opacity-30" />
                <p className="text-sm font-semibold text-muted">Aucune notification</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotifItem key={n.id} notif={n} onRead={markRead} />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-line px-4 py-3">
              <Link
                href="/notifications"
                className="block text-center text-xs font-semibold text-brand-600 hover:underline"
                onClick={() => setOpen(false)}
              >
                Voir toutes les notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
