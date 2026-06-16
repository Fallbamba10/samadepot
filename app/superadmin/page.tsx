import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  Database,
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

const PLAN_META: Record<string, { label: string; color: string }> = {
  free:     { label: "Gratuit",  color: "bg-slate-100 text-muted" },
  basic:    { label: "Basic",    color: "bg-saffron-50 text-saffron-500" },
  standard: { label: "Standard", color: "bg-lagoon-50 text-lagoon-500" },
  premium:  { label: "Premium",  color: "bg-brand-50 text-brand-600" }
};

export default async function SuperAdminPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "superadmin") {
    redirect("/dashboard");
  }

  let universities: UniversityRow[] = [];
  let globalStats = { totalUniversities: 0, totalUsers: 0, totalSubmissions: 0, totalStorageMb: 0 };

  if (hasSupabaseAdminConfig()) {
    const supabaseAdmin = createSupabaseAdminClient();

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

      {/* Liste des universités */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-brand-600" />
          <h2 className="text-base font-bold text-ink">Universités inscrites</h2>
        </div>

        {universities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
            <Building2 className="mx-auto h-8 w-8 text-muted" />
            <p className="mt-3 text-sm font-semibold text-ink">Aucune université</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {universities.map((uni) => (
              <UniCard key={uni.id} uni={uni} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function UniCard({ uni }: { uni: UniversityRow }) {
  const plan = PLAN_META[uni.plan] ?? PLAN_META.free;
  const storagePct = uni.max_storage_gb > 0
    ? Math.min(100, Math.round((uni.used_storage_mb / (uni.max_storage_gb * 1024)) * 100))
    : 0;
  const storageUsed = uni.used_storage_mb >= 1024
    ? `${(uni.used_storage_mb / 1024).toFixed(1)} Go`
    : `${uni.used_storage_mb} Mo`;

  return (
    <div className={cn(
      "flex flex-col rounded-2xl border bg-white p-5 transition hover:shadow-soft",
      uni.is_active ? "border-line" : "border-line opacity-60"
    )}>
      {/* En-tête */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-600">
          {uni.slug.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", plan.color)}>
            {plan.label}
          </span>
          {!uni.is_active && (
            <span className="rounded-full bg-coral-50 px-2.5 py-1 text-[10px] font-bold text-coral-500">
              Suspendu
            </span>
          )}
        </div>
      </div>

      <h3 className="mt-3 text-sm font-bold leading-snug text-ink">{uni.name}</h3>
      <p className="text-xs text-muted">{uni.slug}</p>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <StatMini label="Étudiants" value={uni.totalStudents} />
        <StatMini label="Profs" value={uni.totalTeachers} />
        <StatMini label="Dépôts" value={uni.totalSubmissions} />
      </div>

      {/* Stockage */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted">
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            Stockage
          </span>
          <span>{storageUsed} / {uni.max_storage_gb} Go · {storagePct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn("h-full rounded-full transition-all", storagePct > 90 ? "bg-coral-500" : storagePct > 70 ? "bg-saffron-500" : "bg-brand-600")}
            style={{ width: `${storagePct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Link
          href={`/admin?uni=${uni.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line bg-white py-2 text-xs font-semibold text-muted transition hover:text-ink"
        >
          Gérer
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
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

function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 py-2">
      <p className="text-base font-bold text-ink">{value}</p>
      <p className="text-[10px] text-muted">{label}</p>
    </div>
  );
}
