import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";
import { getSiteUrl } from "@/lib/env";

// POST /api/invitations — créer un lien d'invitation pour une classe
export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !["teacher", "admin", "superadmin"].includes(currentUser.role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: "Supabase admin non configure" }, { status: 503 });
  }

  const body = await request.json();
  const classId = String(body.classId ?? "");
  const expiresInDays = Number(body.expiresInDays ?? 30);
  const maxUses = body.maxUses ? Number(body.maxUses) : null;

  if (!classId) {
    return NextResponse.json({ error: "classId requis" }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // Vérifie que la classe appartient à l'université du prof
  const { data: cls, error: clsError } = await supabaseAdmin
    .from("academic_classes")
    .select("id,name,university_id")
    .eq("id", classId)
    .single();

  if (clsError || !cls) {
    return NextResponse.json({ error: "Classe introuvable" }, { status: 404 });
  }

  if (currentUser.role !== "superadmin" && cls.university_id !== currentUser.universityId) {
    return NextResponse.json({ error: "Classe hors de votre universite" }, { status: 403 });
  }

  const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const expiresAt = new Date(Date.now() + expiresInDays * 86400_000).toISOString();

  const { data: invitation, error: invError } = await supabaseAdmin
    .from("class_invitations")
    .insert({
      token,
      university_id: cls.university_id,
      class_id: classId,
      created_by: currentUser.id,
      expires_at: expiresAt,
      max_uses: maxUses
    })
    .select("id,token")
    .single();

  if (invError || !invitation) {
    return NextResponse.json({ error: invError?.message ?? "Creation impossible" }, { status: 400 });
  }

  const url = `${getSiteUrl()}/join/${invitation.token}`;
  return NextResponse.json({ data: { url, token: invitation.token, className: cls.name } }, { status: 201 });
}
