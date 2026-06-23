export const dynamic = "force-dynamic";

import {
  Activity,
  Building2,
  GraduationCap,
  Settings,
  Shield,
  Users
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";
import {
  getAcademicOptions,
  getAdminDashboard,
  getAdminOverview,
  getAdminUsers,
  getAuditLogs,
} from "@/lib/data";
import { AcademicManagement } from "./academic-management";
import { AdminDashboardSection } from "./admin-dashboard-section";
import { PlanBanner } from "./plan-banner";
import { CreateUserForm } from "./create-user-form";
import { OnboardingBanner } from "./onboarding-banner";
import { UserManagement } from "./user-management";
import { ImportCsvButton } from "@/components/import-csv-button";
import { InviteClassButton } from "@/components/invite-class-button";
import { InviteTeacherButton } from "@/components/invite-teacher-button";
import { AuditLogsSection } from "./audit-logs-section";

export default async function AdminPage() {
  const [currentUser, overview, users, academicOptions, dashboardData, auditLogs] =
    await Promise.all([
      getCurrentUser(),
      getAdminOverview(),
      getAdminUsers(),
      getAcademicOptions(),
      getAdminDashboard(),
      getAuditLogs(50),
    ]);

  return (
    <AppShell active="Admin">
      {/* En-tête */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-600">
            <Building2 className="h-4 w-4" />
            Administration
          </div>
          <h1 className="mt-1 text-2xl font-bold text-ink">
            {overview.universityName}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {overview.totalStudents} étudiant{overview.totalStudents > 1 ? "s" : ""} ·{" "}
            {overview.totalTeachers} professeur{overview.totalTeachers > 1 ? "s" : ""} ·{" "}
            {overview.usedStorageMb} Mo utilisés
          </p>
        </div>
      </div>

      {/* Bandeau plan & quotas */}
      <PlanBanner overview={overview} />

      {/* Onboarding — visible seulement si la plateforme est vierge */}
      <OnboardingBanner
        hasClasses={academicOptions.classes.length > 0}
        hasUsers={overview.totalTeachers > 0 || overview.totalStudents > 0}
        hasSpaces={overview.totalSpaces > 0}
      />

      {/* ─── SECTION 1 : MEMBRES ─────────────────────────────────────────────── */}
      <section className="mb-10">
        <SectionHeader icon={<Users className="h-4 w-4" />} title="Membres" />

        {/* Actions d'invitation — toujours visibles en haut */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-line bg-white">
          <div className="border-b border-line bg-slate-50 px-5 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Ajouter des membres
            </p>
          </div>
          <div className="p-5">
            <p className="mb-4 text-sm text-muted">
              Choisis comment ajouter des membres à ta plateforme. Le lien d&apos;invitation est
              la méthode la plus rapide : partage-le sur WhatsApp, la personne crée son propre compte.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Colonne 1 : Inviter un prof */}
              <div className="rounded-xl border border-lagoon-100 bg-lagoon-50 p-4">
                <div className="mb-1 text-xs font-bold text-lagoon-700">
                  Professeur
                </div>
                <p className="mb-3 text-xs text-lagoon-600">
                  Génère un lien d&apos;inscription, partage-le au prof. Il crée son compte lui-même.
                </p>
                <InviteTeacherButton />
              </div>

              {/* Colonne 2 : Inviter des étudiants */}
              <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
                <div className="mb-1 text-xs font-bold text-brand-700">
                  Étudiants (par classe)
                </div>
                <p className="mb-3 text-xs text-brand-600">
                  Génère un lien par classe. Les étudiants s&apos;inscrivent et sont automatiquement inscrits dans la bonne classe.
                </p>
                {academicOptions.classes.length > 0 ? (
                  <InviteClassButton classes={academicOptions.classes} />
                ) : (
                  <p className="rounded-lg border border-brand-200 bg-white px-3 py-2 text-xs text-brand-500">
                    Crée d&apos;abord une classe dans &quot;Structure académique&quot; ci-dessous.
                  </p>
                )}
              </div>

              {/* Colonne 3 : Création manuelle */}
              <div className="rounded-xl border border-line bg-white p-4">
                <div className="mb-1 text-xs font-bold text-ink">
                  Création manuelle
                </div>
                <p className="mb-3 text-xs text-muted">
                  Crée un compte directement (tu gères le mot de passe). Utile pour un admin ou un prof sans accès WhatsApp.
                </p>
                <CreateUserForm universityId={currentUser?.universityId ?? ""} />
              </div>
            </div>

            {/* Import CSV — option secondaire */}
            <div className="mt-4 rounded-xl border border-dashed border-line p-4">
              <p className="mb-2 text-xs font-bold text-ink">Import CSV en masse</p>
              <p className="mb-3 text-xs text-muted">
                Importe un fichier Excel/CSV pour créer des dizaines de comptes en une fois. Format attendu : nom, email, rôle.
              </p>
              <ImportCsvButton defaultRole="student" />
            </div>
          </div>
        </div>

        {/* Liste des membres */}
        <UserManagement users={users} />
      </section>

      {/* ─── SECTION 2 : STRUCTURE ACADÉMIQUE ───────────────────────────────── */}
      <section className="mb-10">
        <SectionHeader icon={<GraduationCap className="h-4 w-4" />} title="Structure académique" />
        <AcademicManagement options={academicOptions} />
      </section>

      {/* ─── SECTION 3 : ACTIVITÉ EN COURS ──────────────────────────────────── */}
      <section className="mb-10">
        <SectionHeader icon={<Activity className="h-4 w-4" />} title="Activité en cours" />
        <AdminDashboardSection data={dashboardData} />
      </section>

      {/* ─── SECTION 4 : JOURNAL D'AUDIT ─────────────────────────────────────── */}
      <section className="mb-10">
        <SectionHeader icon={<Shield className="h-4 w-4" />} title="Journal d'audit" />
        <AuditLogsSection logs={auditLogs} />
      </section>
    </AppShell>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-brand-600">{icon}</span>
      <h2 className="text-base font-bold text-ink">{title}</h2>
      <span className="flex-1 border-t border-line" />
    </div>
  );
}
