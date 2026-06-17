import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";
import { getSiteUrl } from "@/lib/env";

// POST /api/invitations — créer un lien d'invitation (étudiant ou professeur)
export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !["teacher", "admin", "superadmin"].includes(currentUser.role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: "Supabase admin non configure" }, { status: 503 });
  }

  const body = await request.json();
  const role: string = ["teacher", "student"].includes(body.role) ? body.role : "student";
  const expiresInDays = Number(body.expiresInDays ?? 30);

  // classId requis seulement pour les étudiants
  const classId = role === "student" ? String(body.classId ?? "") : null;
  if (role === "student" && !classId) {
    return NextResponse.json({ error: "classId requis pour les étudiants" }, { status: 400 });
  }

  // Les profs ne peuvent inviter que des étudiants dans leurs classes
  if (role === "teacher" && currentUser.role === "teacher") {
    return NextResponse.json({ error: "Les professeurs ne peuvent pas créer des invitations prof" }, { status: 403 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  let universityId: string;
  let className: string | null = null;

  if (role === "student" && classId) {
    // Vérifie que la classe appartient à l'université
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
    universityId = cls.university_id;
    className = cls.name;
  } else {
    // Invitation prof — lié à l'université de l'admin
    universityId = currentUser.universityId;
  }

  const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const expiresAt = new Date(Date.now() + expiresInDays * 86400_000).toISOString();

  const { data: invitation, error: invError } = await supabaseAdmin
    .from("class_invitations")
    .insert({
      token,
      university_id: universityId,
      class_id: classId ?? null,
      role,
      created_by: currentUser.id,
      expires_at: expiresAt,
      max_uses: body.maxUses ? Number(body.maxUses) : null
    })
    .select("id,token")
    .single();

  if (invError || !invitation) {
    return NextResponse.json({ error: invError?.message ?? "Creation impossible" }, { status: 400 });
  }

  const url = `${getSiteUrl()}/join/${invitation.token}`;
  return NextResponse.json({
    data: { url, token: invitation.token, className: className ?? "Professeurs", role }
  }, { status: 201 });
}
