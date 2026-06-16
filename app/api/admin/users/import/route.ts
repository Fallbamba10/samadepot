import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";

type ImportRow = {
  fullName: string;
  email: string;
  role: "student" | "teacher";
  studentNumber?: string;
  departmentCode?: string;
  level?: string;
  phone?: string;
};

// POST /api/admin/users/import — importer une liste CSV d'utilisateurs
export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !["admin", "superadmin"].includes(currentUser.role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: "Supabase admin non configure" }, { status: 503 });
  }

  const body = await request.json();
  const rows: ImportRow[] = body.rows ?? [];
  const defaultRole: "student" | "teacher" = body.defaultRole === "teacher" ? "teacher" : "student";

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Aucune ligne fournie" }, { status: 400 });
  }
  if (rows.length > 500) {
    return NextResponse.json({ error: "Maximum 500 lignes par import" }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const universityId = currentUser.universityId;

  const results: { email: string; status: "created" | "skipped" | "error"; message?: string }[] = [];

  for (const row of rows) {
    const email = String(row.email ?? "").trim().toLowerCase();
    const fullName = String(row.fullName ?? "").trim();
    const role = row.role === "teacher" ? "teacher" : defaultRole;

    if (!email || !email.includes("@") || !fullName) {
      results.push({ email: email || "(vide)", status: "error", message: "Email ou nom manquant" });
      continue;
    }

    // Génère un mot de passe temporaire
    const password = crypto.randomUUID().replaceAll("-", "").slice(0, 12);

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role }
    });

    if (authError) {
      const isExisting = authError.message.toLowerCase().includes("already");
      results.push({
        email,
        status: isExisting ? "skipped" : "error",
        message: isExisting ? "Email déjà inscrit" : authError.message
      });
      continue;
    }

    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: authData.user!.id,
      university_id: universityId,
      email,
      full_name: fullName,
      role,
      phone: row.phone || null,
      student_number: row.studentNumber || null,
      department_code: row.departmentCode || null,
      level: row.level || null
    });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user!.id);
      results.push({ email, status: "error", message: profileError.message });
      continue;
    }

    results.push({ email, status: "created" });
  }

  const created = results.filter((r) => r.status === "created").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const errors = results.filter((r) => r.status === "error").length;

  return NextResponse.json({ data: { created, skipped, errors, rows: results } }, { status: 207 });
}
