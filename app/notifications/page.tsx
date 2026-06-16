import Link from "next/link";
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
import { AppShell } from "@/components/app-shell";
import { getNotifications } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types";
import { NotificationsClient } from "./notifications-client";

export const metadata = { title: "Notifications — SamaDepot" };

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <AppShell active="Dashboard">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Notifications</h1>
            <p className="mt-1 text-sm text-muted">
              {unread > 0
                ? `${unread} non lue${unread > 1 ? "s" : ""}`
                : "Tout est à jour"}
            </p>
          </div>
        </div>
        <NotificationsClient initialNotifications={notifications} />
      </div>
    </AppShell>
  );
}
