import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig
} from "@/lib/supabase-admin";
import { updateUserSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload invalide", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (id === currentUser.id && parsed.data.isActive === false) {
    return NextResponse.json(
      { error: "Impossible de desactiver ton propre compte" },
      { status: 400 }
    );
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: target, error: targetError } = await supabaseAdmin
    .from("users")
    .select("id,email,full_name,role,university_id,is_active")
    .eq("id", id)
    .single();

  if (targetError || !target) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  if (
    currentUser.role === "admin" &&
    (target.university_id !== currentUser.universityId ||
      target.role === "superadmin" ||
      parsed.data.role === "admin")
  ) {
    return NextResponse.json({ error: "Action non autorisee" }, { status: 403 });
  }

  const updatePayload = {
    full_name: parsed.data.fullName,
    role: parsed.data.role,
    phone: parsed.data.phone,
    student_number: parsed.data.studentNumber,
    department_code: parsed.data.departmentCode,
    level: parsed.data.level,
    is_active: parsed.data.isActive
  };

  const { data: updatedUser, error: updateError } = await supabaseAdmin
    .from("users")
    .update(updatePayload)
    .eq("id", id)
    .select("id,email,full_name,role,is_active")
    .single();

  if (updateError || !updatedUser) {
    return NextResponse.json(
      { error: updateError?.message ?? "Modification impossible" },
      { status: 400 }
    );
  }

  await supabaseAdmin.auth.admin.updateUserById(id, {
    user_metadata: {
      full_name: updatedUser.full_name,
      role: updatedUser.role
    }
  });

  await supabaseAdmin.from("audit_logs").insert({
    user_id: currentUser.id,
    university_id: target.university_id,
    action: "UPDATE_USER",
    resource_type: "user",
    resource_id: id,
    old_value: target,
    new_value: updatedUser
  });

  return NextResponse.json({ data: updatedUser });
}
