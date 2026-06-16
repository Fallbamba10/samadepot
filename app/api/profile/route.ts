import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await request.json();
  const fullName = String(body.fullName ?? "").trim();
  const phone = String(body.phone ?? "").trim() || null;

  if (fullName.length < 2) return NextResponse.json({ error: "Nom trop court" }, { status: 400 });
  if (!hasSupabaseAdminConfig()) return NextResponse.json({ data: { updated: true } });

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("users")
    .update({ full_name: fullName, phone })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data: { updated: true } });
}
