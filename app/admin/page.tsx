import { Building2, Database, LayoutDashboard, Settings, ShieldCheck, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatGrid } from "@/components/stat-grid";
import { getCurrentUser } from "@/lib/auth";
import {
  getAcademicOptions,
  getAdminDashboard,
  getAdminOverview,
  getAdminUsers,
  getDashboardStats
} from "@/lib/data";
import { AcademicManagement } from "./academic-management";
import { AdminDashboardSection } from "./admin-dashboard-section";
import { CreateUserForm } from "./create-user-form";
import { UserManagement } from "./user-management";
import { ImportCsvButton } from "@/components/import-csv-button";
import { cn } from "@/lib/utils";

export default async function AdminPage() {
  const [currentUser, stats, overview, users, academicOptions, dashboardData] = await Promise.all([
    getCurrentUser(),
    getDashboardStats(),
    getAdminOverview(),
    getAdminUsers(),
    getAcademicOptions(),
    getAdminDashboard()
  ]);

  const adminChecks = [
    {
      label: "Isolation university_id",
      status: "RLS active",
      icon: ShieldCheck
    },
    {
      label: "Comptes actifs",
      status: `${overview.totalUsers} utilisateurs`,
      icon: UsersRound
    },
    {
      label: "Stockage utilise",
      status: `${overview.usedStorageMb} Mo sur ${overview.maxStorageGb} Go`,
      icon: Database
    },
    {
      label: "Universite",
      status: overview.universityName,
      icon: Building2
    }
  ];

  const tabs = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "config",    label: "Configuration",   icon: Settings },
  ] as const;

  return (
    <AppShell active="Admin">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Administration — {overview.universityName}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {overview.totalStudents} étudiants · {overview.totalTeachers} professeurs · {overview.usedStorageMb} Mo utilisés
        </p>
      </div>

      {/* KPIs */}
      <StatGrid stats={stats} />

      {/* Onglets dashboard / config */}
      <div className="mt-8">
        <div className="mb-6 flex gap-1 rounded-2xl border border-line bg-white p-1 w-fit">
          {tabs.map(t => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                "text-muted hover:text-ink"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </a>
          ))}
        </div>

        {/* Section tableau de bord opérationnel */}
        <div id="dashboard">
          <div className="mb-4 flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-brand-600" />
            <h2 className="text-base font-bold text-ink">Activité en cours</h2>
          </div>
          <AdminDashboardSection data={dashboardData} />
        </div>

        {/* Section configuration */}
        <div id="config" className="space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-brand-600" />
            <h2 className="text-base font-bold text-ink">Configuration</h2>
          </div>

          {/* Infos système */}
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {adminChecks.map((item) => (
              <div key={item.label} className="rounded-xl border border-line bg-white p-4">
                <item.icon className="h-5 w-5 text-brand-600" />
                <div className="mt-3 text-sm font-bold text-ink">{item.label}</div>
                <div className="mt-1 text-xs text-muted">{item.status}</div>
              </div>
            ))}
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-brand-50 px-4 py-3">
              <div>
                <p className="text-xs font-bold text-brand-600">Option 1 — Lien d'invitation</p>
                <p className="text-[11px] text-muted mt-0.5">Le prof partage un lien WhatsApp, les étudiants s'inscrivent eux-mêmes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-line bg-slate-50 px-4 py-3">
              <div>
                <p className="text-xs font-bold text-ink">Option 2 — Import CSV</p>
                <p className="text-[11px] text-muted mt-0.5">L'admin importe une liste Excel, tous les comptes créés en 1 clic</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <CreateUserForm universityId={currentUser?.universityId ?? ""} />
            <ImportCsvButton defaultRole="student" />
          </div>

          <AcademicManagement options={academicOptions} />
          <UserManagement users={users} />
        </div>
      </div>
    </AppShell>
  );
}
