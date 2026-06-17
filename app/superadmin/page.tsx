import {
  Activity,
  Building2,
  GraduationCap,
  HardDrive,
  TrendingUp,
  Users
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { SchoolRequestsSection } from "./school-requests-section";
import { SystemHealth } from "./system-health";
import { UniversitiesList } from "./universities-list";

type UniversityRow = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  is_active: boolean;
  max_storage_gb: number;
  used_storage_mb: number;
  created_at: string;
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalSpaces: number;
  totalSubmissions: number;
};

export default async function SuperAdminPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "superadmin") {
    redirect("/dashboard");
  }

  let universities: UniversityRow[] = [];
  let globalStats = { totalUniversities: 0, totalUsers: 0, totalSubmissions: 0, totalStorageMb: 0 };

  type SchoolRequest = {
    id: string;
    universityName: string;
    emailDomain: string;
    contactName: string;
    contactEmail: string;
    phone: string | null;
    studentsCount: string | null;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    rejectReason?: string | null;
  };
  let schoolRequests: SchoolRequest[] = [];

  if (hasSupabaseAdminConfig()) {
    const supabaseAdmin = createSupabaseAdminClient();

    // Charger les demandes d'inscription
    const { data: reqData, error: reqError } = await supabaseAdmin
      .from("school_registration_requests")
      .select("id,university_name,email_domain,contact_name,contact_email,phone,students_count,status,created_at,reject_reason")
      .order("created_at", { ascending: false })
      .limit(50);

    if (reqError) {
      console.error("school_registration_requests query error:", reqError.message);
    }

    schoolRequests = (reqData ?? []).map((r: any) => ({
      id: r.id,
      universityName: r.university_name,
      emailDomain: r.email_domain,
      contactName: r.contact_name,
      contactEmail: r.contact_email,
      phone: r.phone ?? null,
      studentsCount: r.students_count ?? null,
      status: r.status as "pending" | "approved" | "rejected",
      createdAt: new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      rejectReason: r.reject_reason ?? null
    }));

    const { data: unis } = await supabaseAdmin
      .from("universities")
      .select("id,name,slug,plan,is_active,max_storage_gb,used_storage_mb,created_at")
      .order("created_at", { ascending: false });

    if (unis && unis.length > 0) {
      const uniIds = unis.map((u: any) => u.id);

      const [usersResult, spacesResult, submissionsResult] = await Promise.all([
        supabaseAdmin
          .from("users")
          .select("university_id,role")
          .in("university_id", uniIds),
        supabaseAdmin
          .from("submission_spaces")
          .select("university_id")
          .in("university_id", uniIds),
        supabaseAdmin
          .from("submissions")
          .select("university_id")
          .in("university_id", uniIds)
      ]);

      const usersByUni = new Map<string, { total: number; students: number; teachers: number }>();
      for (const u of usersResult.data ?? []) {
        const cur = usersByUni.get(u.university_id) ?? { total: 0, students: 0, teachers: 0 };
        cur.total++;
        if (u.role === "student") cur.students++;
        if (u.role === "teacher") cur.teachers++;
        usersByUni.set(u.university_id, cur);
      }

      const spacesByUni = new Map<string, number>();
      for (const s of spacesResult.data ?? []) {
        spacesByUni.set(s.university_id, (spacesByUni.get(s.university_id) ?? 0) + 1);
      }

      const subsByUni = new Map<string, number>();
      for (const s of submissionsResult.data ?? []) {
        subsByUni.set(s.university_id, (subsByUni.get(s.university_id) ?? 0) + 1);
      }

      universities = unis.map((u: any) => ({
        ...u,
        totalUsers: usersByUni.get(u.id)?.total ?? 0,
        totalStudents: usersByUni.get(u.id)?.students ?? 0,
        totalTeachers: usersByUni.get(u.id)?.teachers ?? 0,
        totalSpaces: spacesByUni.get(u.id) ?? 0,
        totalSubmissions: subsByUni.get(u.id) ?? 0
      }));

      globalStats = {
        totalUniversities: unis.length,
        totalUsers: (usersResult.data ?? []).length,
        totalSubmissions: (submissionsResult.data ?? []).length,
        totalStorageMb: unis.reduce((sum: number, u: any) => sum + Number(u.used_storage_mb ?? 0), 0)
      };
    }
  }

  return (
    <AppShell active="Dashboard">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-600">
          <Activity className="h-4 w-4" />
          Tableau de bord SamaDepot
        </div>
        <h1 className="mt-1 text-2xl font-bold text-ink">Vue propriétaire</h1>
        <p className="mt-1 text-sm text-muted">
          {globalStats.totalUniversities} université{globalStats.totalUniversities > 1 ? "s" : ""} inscrite{globalStats.totalUniversities > 1 ? "s" : ""} sur la plateforme
        </p>
      </div>

      {/* KPIs globaux */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<Building2 className="h-5 w-5" />} label="Universités" value={String(globalStats.totalUniversities)} color="brand" />
        <KpiCard icon={<Users className="h-5 w-5" />} label="Utilisateurs total" value={String(globalStats.totalUsers)} color="lagoon" />
        <KpiCard icon={<TrendingUp className="h-5 w-5" />} label="Dépôts total" value={String(globalStats.totalSubmissions)} color="saffron" />
        <KpiCard
          icon={<HardDrive className="h-5 w-5" />}
          label="Stockage utilisé"
          value={globalStats.totalStorageMb >= 1024
            ? `${(globalStats.totalStorageMb / 1024).toFixed(1)} Go`
            : `${globalStats.totalStorageMb} Mo`}
          color="slate"
        />
      </div>

      {/* Santé du système */}
      <SystemHealth checks={[
        {
          label: "Supabase Admin",
          ok: hasSupabaseAdminConfig(),
          detail: hasSupabaseAdminConfig()
            ? "SUPABASE_SERVICE_ROLE_KEY configurée"
            : "SUPABASE_SERVICE_ROLE_KEY manquante",
          fix: "Ajouter SUPABASE_SERVICE_ROLE_KEY dans Vercel → Environment Variables"
        },
        {
          label: "Email (Resend API Key)",
          ok: Boolean(process.env.RESEND_API_KEY),
          detail: process.env.RESEND_API_KEY
            ? "RESEND_API_KEY configurée"
            : "RESEND_API_KEY manquante — aucun email ne part",
          fix: "Ajouter RESEND_API_KEY depuis resend.com/api-keys"
        },
        {
          label: "Email expéditeur (EMAIL_FROM)",
          ok: Boolean(process.env.EMAIL_FROM),
          detail: process.env.EMAIL_FROM
            ? `Expéditeur : ${process.env.EMAIL_FROM}`
            : "EMAIL_FROM manquant — emails envoyés depuis onboarding@resend.dev (domaine non vérifié)",
          fix: "Ajouter EMAIL_FROM=noreply@samadepot.app après vérification domaine Resend"
        },
        {
          label: "Cron secret (CRON_SECRET)",
          ok: Boolean(process.env.CRON_SECRET),
          detail: process.env.CRON_SECRET
            ? "CRON_SECRET configuré — rappels deadline sécurisés"
            : "CRON_SECRET manquant — route /api/cron/deadline-reminder accessible sans auth",
          fix: "Générer avec `openssl rand -hex 32` et ajouter dans Vercel"
        },
        {
          label: "URL du site (NEXT_PUBLIC_SITE_URL)",
          ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
          detail: process.env.NEXT_PUBLIC_SITE_URL
            ? `URL : ${process.env.NEXT_PUBLIC_SITE_URL}`
            : "NEXT_PUBLIC_SITE_URL manquant — liens dans les emails pointent vers localhost",
          fix: "Ajouter NEXT_PUBLIC_SITE_URL=https://samadepot.vercel.app dans Vercel"
        }
      ]} />

      {/* Demandes d'inscription */}
      <SchoolRequestsSection initialRequests={schoolRequests} />

      {/* Liste des universités */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-brand-600" />
          <h2 className="text-base font-bold text-ink">Universités inscrites</h2>
        </div>

        <UniversitiesList initialUniversities={universities} />
      </section>
    </AppShell>
  );
}

function KpiCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "brand" | "lagoon" | "saffron" | "slate";
}) {
  const colors = {
    brand:   "bg-brand-50 text-brand-600",
    lagoon:  "bg-lagoon-50 text-lagoon-500",
    saffron: "bg-saffron-50 text-saffron-500",
    slate:   "bg-slate-100 text-muted"
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", colors[color])}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-ink">{value}</p>
        <p className="text-xs font-semibold text-muted">{label}</p>
      </div>
    </div>
  );
}
