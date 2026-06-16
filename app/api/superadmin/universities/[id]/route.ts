import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || user.role !== "superadmin") {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: "Non configure" }, { status: 503 });
  }

  const body = await request.json();
  const allowed = ["plan", "is_active", "max_storage_gb"] as const;
  const update: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Aucun champ modifiable fourni" }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("universities")
    .update(update)
    .eq("id", id)
    .select("id,name,plan,is_active,max_storage_gb")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
