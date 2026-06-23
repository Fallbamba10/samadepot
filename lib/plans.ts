export type PlanId = "free" | "basic" | "standard" | "premium";

export type PlanLimits = {
  maxTeachers: number;
  maxStudents: number;
  maxSpaces: number;     // espaces actifs simultanément
  maxStorageGb: number;
  label: string;
  priceFcfa: number | null;
};

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    label: "Starter (Gratuit)",
    priceFcfa: null,
    maxTeachers: 5,
    maxStudents: 200,
    maxSpaces: 10,
    maxStorageGb: 5,
  },
  basic: {
    label: "Basic",
    priceFcfa: 15_000,
    maxTeachers: 30,
    maxStudents: 1_000,
    maxSpaces: 100,
    maxStorageGb: 20,
  },
  standard: {
    label: "Standard",
    priceFcfa: 25_000,
    maxTeachers: 80,
    maxStudents: 3_000,
    maxSpaces: 300,
    maxStorageGb: 50,
  },
  premium: {
    label: "Premium",
    priceFcfa: 35_000,
    maxTeachers: 99_999,
    maxStudents: 99_999,
    maxSpaces: 99_999,
    maxStorageGb: 100,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as PlanId] ?? PLAN_LIMITS.free;
}

type LimitCheck = { allowed: true } | { allowed: false; error: string; upgrade: string };

export async function checkPlanLimit(
  supabaseAdmin: ReturnType<typeof import("@/lib/supabase-admin").createSupabaseAdminClient>,
  universityId: string,
  check: "teachers" | "students" | "spaces" | "storage",
  extraMb?: number
): Promise<LimitCheck> {
  const { data: uni } = await supabaseAdmin
    .from("universities")
    .select("plan, used_storage_mb, max_storage_gb")
    .eq("id", universityId)
    .single();

  if (!uni) return { allowed: true }; // pas bloquant si la query échoue

  const limits = getPlanLimits(uni.plan ?? "free");

  if (check === "storage") {
    const usedGb = (uni.used_storage_mb + (extraMb ?? 0)) / 1024;
    if (usedGb > limits.maxStorageGb) {
      return {
        allowed: false,
        error: `Quota de stockage atteint (${limits.maxStorageGb} Go sur le plan ${limits.label}).`,
        upgrade: "Passez à un plan supérieur pour augmenter votre espace."
      };
    }
    return { allowed: true };
  }

  if (check === "teachers") {
    const { count } = await supabaseAdmin
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("university_id", universityId)
      .eq("role", "teacher");
    if ((count ?? 0) >= limits.maxTeachers) {
      return {
        allowed: false,
        error: `Limite de professeurs atteinte (${limits.maxTeachers} max sur le plan ${limits.label}).`,
        upgrade: "Passez au plan Basic ou supérieur pour ajouter plus de professeurs."
      };
    }
    return { allowed: true };
  }

  if (check === "students") {
    const { count } = await supabaseAdmin
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("university_id", universityId)
      .eq("role", "student");
    if ((count ?? 0) >= limits.maxStudents) {
      return {
        allowed: false,
        error: `Limite d'étudiants atteinte (${limits.maxStudents} max sur le plan ${limits.label}).`,
        upgrade: "Passez au plan Basic ou supérieur pour ajouter plus d'étudiants."
      };
    }
    return { allowed: true };
  }

  if (check === "spaces") {
    const { count } = await supabaseAdmin
      .from("submission_spaces")
      .select("id", { count: "exact", head: true })
      .eq("university_id", universityId)
      .eq("is_active", true);
    if ((count ?? 0) >= limits.maxSpaces) {
      return {
        allowed: false,
        error: `Limite d'espaces actifs atteinte (${limits.maxSpaces} max sur le plan ${limits.label}).`,
        upgrade: "Passez à un plan supérieur ou clôturez des espaces existants."
      };
    }
    return { allowed: true };
  }

  return { allowed: true };
}
