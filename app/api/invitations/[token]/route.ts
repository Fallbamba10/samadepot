import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";

// GET /api/invitations/:token — info publique sur l'invitation (page /join)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: "Non configure" }, { status: 503 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("class_invitations")
    .select("id,expires_at,max_uses,use_count,is_active,academic_classes(name,level,code),universities(name)")
    .eq("token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
  }

  if (!data.is_active) {
    return NextResponse.json({ error: "Invitation desactivee" }, { status: 410 });
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invitation expiree" }, { status: 410 });
  }

  if (data.max_uses && data.use_count >= data.max_uses) {
    return NextResponse.json({ error: "Invitation epuisee" }, { status: 410 });
  }

  const cls = Array.isArray(data.academic_classes) ? data.academic_classes[0] : data.academic_classes;
  const uni = Array.isArray(data.universities) ? data.universities[0] : data.universities;

  return NextResponse.json({
    data: {
      className: cls?.name ?? "Classe",
      classCode: cls?.code ?? "",
      classLevel: cls?.level ?? "",
      universityName: uni?.name ?? "Universite",
      expiresAt: data.expires_at,
    }
  });
}

// POST /api/invitations/:token — s'inscrire via le lien
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: "Non configure" }, { status: 503 });
  }

  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const fullName = String(body.fullName ?? "").trim();
  const password = String(body.password ?? "").trim();
  const studentNumber = String(body.studentNumber ?? "").trim() || undefined;
  const phone = String(body.phone ?? "").trim() || undefined;

  if (!email || !fullName || password.length < 8) {
    return NextResponse.json({ error: "Email, nom et mot de passe (8 car. min) requis" }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // Vérifie l'invitation
  const { data: invitation, error: invError } = await supabaseAdmin
    .from("class_invitations")
    .select("id,class_id,university_id,expires_at,max_uses,use_count,is_active")
    .eq("token", token)
    .single();

  if (invError || !invitation) {
    return NextResponse.json({ error: "Invitation invalide" }, { status: 404 });
  }

  if (!invitation.is_active) {
    return NextResponse.json({ error: "Invitation desactivee" }, { status: 410 });
  }
  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invitation expiree" }, { status: 410 });
  }
  if (invitation.max_uses && invitation.use_count >= invitation.max_uses) {
    return NextResponse.json({ error: "Invitation epuisee" }, { status: 410 });
  }

  // Crée le compte Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "student" }
  });

  if (authError || !authData.user) {
    const msg = authError?.message ?? "Creation impossible";
    const alreadyExists = msg.toLowerCase().includes("already") || msg.includes("already registered");
    return NextResponse.json(
      { error: alreadyExists ? "Cet email est deja inscrit" : msg },
      { status: 400 }
    );
  }

  // Crée le profil utilisateur
  const { error: profileError } = await supabaseAdmin.from("users").insert({
    id: authData.user.id,
    university_id: invitation.university_id,
    email,
    full_name: fullName,
    role: "student",
    phone,
    student_number: studentNumber
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  // Inscrit l'étudiant dans la classe
  await supabaseAdmin.from("class_students").insert({
    university_id: invitation.university_id,
    class_id: invitation.class_id,
    student_id: authData.user.id
  });

  // Incrémente use_count
  await supabaseAdmin
    .from("class_invitations")
    .update({ use_count: invitation.use_count + 1 })
    .eq("id", invitation.id);

  return NextResponse.json({ data: { email, message: "Compte cree avec succes" } }, { status: 201 });
}
