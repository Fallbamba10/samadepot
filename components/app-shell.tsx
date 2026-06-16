import Link from "next/link";
import {
  BookOpenCheck,
  Building2,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  UploadCloud
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getNotifications } from "@/lib/data";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notification-bell";

const allNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["student", "teacher", "admin", "superadmin"] },
  { label: "Espaces", href: "/spaces", icon: BookOpenCheck, roles: ["student", "teacher", "admin", "superadmin"] },
  { label: "Depots", href: "/submissions", icon: UploadCloud, roles: ["student", "teacher", "admin", "superadmin"] },
  { label: "Professeur", href: "/teacher", icon: FileCheck2, roles: ["teacher", "admin", "superadmin"] },
  { label: "Admin", href: "/admin", icon: Building2, roles: ["admin", "superadmin"] }
] as const;

export async function AppShell({
  children,
  active = "Dashboard"
}: {
  children: React.ReactNode;
  active?: string;
}) {
  const [user, notifications] = await Promise.all([
    getCurrentUser(),
    getNotifications(),
  ]);
  const role = user?.role ?? "student";
  const initials = user
    ? user.fullName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";
  const universityName = user?.universityName ?? "SamaDepot";

  const navigation = allNavItems.filter((item) =>
    (item.roles as readonly string[]).includes(role)
  );

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-line bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-line px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            SD
          </div>
          <div>
            <div className="text-sm font-bold text-ink">SamaDepot</div>
            <div className="max-w-[160px] truncate text-xs text-muted">{universityName}</div>
          </div>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted transition hover:bg-slate-50 hover:text-ink",
                active === item.label && "bg-brand-50 text-brand-600"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="absolute bottom-0 left-0 right-0 border-t border-line p-4">
            <div className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-ink">{user.fullName}</div>
                <div className="truncate text-xs text-muted">{user.email}</div>
              </div>
            </div>
          </div>
        ) : null}
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white lg:hidden">
              SD
            </div>
            <span className="text-sm font-bold text-ink lg:hidden">SamaDepot</span>
            <div className="hidden items-center gap-2 text-sm text-muted lg:flex">
              <GraduationCap className="h-4 w-4 text-brand-600" />
              {universityName}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell initialNotifications={notifications} />
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                aria-label="Se deconnecter"
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-muted hover:text-ink"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600"
              title={user?.fullName}
            >
              {initials}
            </div>
            {/* Mobile nav toggle — visible uniquement sur mobile */}
            <details className="relative lg:hidden">
              <summary className="focus-ring flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md border border-line bg-white text-muted hover:text-ink">
                <Menu className="h-4 w-4" />
              </summary>
              <nav className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-line bg-white p-2 shadow-soft">
                {navigation.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted hover:bg-slate-50 hover:text-ink",
                      active === item.label && "bg-brand-50 text-brand-600"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </details>
          </div>
        </header>
        <main className="px-4 py-6 pb-24 md:px-8 lg:pb-6">{children}</main>
      </div>

      {/* Bottom navigation mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-white/95 backdrop-blur lg:hidden">
        <div className="flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-semibold transition",
                active === item.label ? "text-brand-600" : "text-muted"
              )}
            >
              <item.icon className={cn("h-5 w-5", active === item.label && "text-brand-600")} />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
