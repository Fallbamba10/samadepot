import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkPlanLimit } from "@/lib/plans";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig
} from "@/lib/supabase-admin";
import { createUserSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !["admin", "superadmin"].includes(currentUser.role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "Supabase admin non configure" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload invalide", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;

  if (
    currentUser.role === "admin" &&
    (input.universityId !== currentUser.universityId || input.role === "admin")
  ) {
    return NextResponse.json(
      { error: "Un admin ne peut creer que des etudiants/professeurs dans son universite" },
      { status: 403 }
    );
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // Vérification limite du plan
  if (currentUser.role !== "superadmin" && ["teacher", "student"].includes(input.role)) {
    const checkType = input.role === "teacher" ? "teachers" : "students";
    const limitCheck = await checkPlanLimit(supabaseAdmin, input.universityId, checkType);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.error, upgrade: limitCheck.upgrade }, { status: 403 });
    }
  }

  const password =
    input.temporaryPassword ?? crypto.randomUUID().replaceAll("-", "").slice(0, 14);

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        role: input.role
      }
    });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Creation auth impossible" },
      { status: 400 }
    );
  }

  const { error: profileError } = await supabaseAdmin.from("users").insert({
    id: authData.user.id,
    university_id: input.universityId,
    email: input.email,
    full_name: input.fullName,
    role: input.role,
    phone: input.phone,
    student_number: input.studentNumber,
    department_code: input.departmentCode,
    level: input.level
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json(
      { error: profileError.message },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      data: {
        id: authData.user.id,
        email: input.email,
        role: input.role,
        temporaryPassword: input.temporaryPassword ? undefined : password
      }
    },
    { status: 201 }
  );
}
