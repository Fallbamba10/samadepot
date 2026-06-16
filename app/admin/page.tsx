import { Building2, Database, ShieldCheck, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatGrid } from "@/components/stat-grid";
import { getCurrentUser } from "@/lib/auth";
import {
  getAcademicOptions,
  getAdminOverview,
  getAdminUsers,
  getDashboardStats
} from "@/lib/data";
import { AcademicManagement } from "./academic-management";
import { CreateUserForm } from "./create-user-form";
import { UserManagement } from "./user-management";

export default async function AdminPage() {
  const [currentUser, stats, overview, users, academicOptions] = await Promise.all([
    getCurrentUser(),
    getDashboardStats(),
    getAdminOverview(),
    getAdminUsers(),
    getAcademicOptions()
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

  return (
    <AppShell active="Admin">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Administration universite
        </h1>
        <p className="mt-1 text-sm text-muted">
          Pilotage des comptes, statistiques, stockage et securite tenant.
        </p>
      </div>
      <StatGrid stats={stats} />
      <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {adminChecks.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-line bg-white p-4 shadow-line"
          >
            <item.icon className="h-5 w-5 text-brand-600" />
            <div className="mt-4 text-sm font-bold text-ink">{item.label}</div>
            <div className="mt-1 text-sm text-muted">{item.status}</div>
          </div>
        ))}
      </section>
      <div className="mt-6 grid gap-6">
        <CreateUserForm universityId={currentUser?.universityId ?? ""} />
        <AcademicManagement options={academicOptions} />
        <UserManagement users={users} />
      </div>
    </AppShell>
  );
}
