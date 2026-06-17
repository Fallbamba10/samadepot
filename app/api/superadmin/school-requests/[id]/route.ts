import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";
import { getSiteUrl } from "@/lib/env";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "superadmin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: "Admin non configuré" }, { status: 500 });
  }

  const body = await request.json();
  const action: "approve" | "reject" = body.action;
  const rejectReason: string = body.reason ?? "";

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: req, error: fetchError } = await supabaseAdmin
    .from("school_registration_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !req) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  if (req.status !== "pending") {
    return NextResponse.json({ error: "Demande déjà traitée" }, { status: 409 });
  }

  // ── REJET ────────────────────────────────────────────────────────────────
  if (action === "reject") {
    await supabaseAdmin
      .from("school_registration_requests")
      .update({ status: "rejected", processed_at: new Date().toISOString(), reject_reason: rejectReason })
      .eq("id", id);

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error: emailErr } = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
        to: req.contact_email,
        subject: "Votre demande d'inscription SamaDepot",
        html: `<p>Bonjour ${req.contact_name},</p>
          <p>Nous avons bien reçu votre demande pour <strong>${req.university_name}</strong>.</p>
          <p>Après examen, nous ne pouvons pas y donner suite pour le moment${rejectReason ? ` : ${rejectReason}` : ""}.</p>
          <p>N'hésitez pas à nous recontacter. L'équipe SamaDepot</p>`
      });
      if (emailErr) console.error("Resend reject email error:", emailErr.message);
    }

    return NextResponse.json({ data: { status: "rejected" } });
  }

  // ── APPROBATION ───────────────────────────────────────────────────────────
  const slug = req.university_name
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  // 1. Créer l'université
  const { data: university, error: uniError } = await supabaseAdmin
    .from("universities")
    .insert({
      name: req.university_name,
      slug: `${slug}-${Date.now().toString(36)}`,
      email_domain: req.email_domain,
      plan: "basic",
      is_active: true,
      max_storage_gb: 10
    })
    .select("id,name,slug")
    .single();

  if (uniError || !university) {
    console.error("University insert error:", uniError?.message);
    return NextResponse.json({ error: `Création université échouée: ${uniError?.message}` }, { status: 500 });
  }

  // 2. Générer un mot de passe temporaire robuste
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#";
  const tempPassword = Array.from({ length: 12 }, (_, i) =>
    chars[(req.contact_email.charCodeAt(i % req.contact_email.length) + i * 7 + Date.now()) % chars.length]
  ).join("") + "X1!"; // garantit majuscule + chiffre + spécial

  // 3. Créer le compte Supabase Auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: req.contact_email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: req.contact_name, role: "admin", university_id: university.id }
  });

  if (authError || !authUser.user) {
    console.error("Auth createUser error:", authError?.message);
    await supabaseAdmin.from("universities").delete().eq("id", university.id);
    return NextResponse.json({ error: `Création compte échouée: ${authError?.message}` }, { status: 500 });
  }

  // 4. Insérer dans la table users
  const { error: userInsertError } = await supabaseAdmin.from("users").insert({
    id: authUser.user.id,
    email: req.contact_email,
    full_name: req.contact_name,
    role: "admin",
    university_id: university.id,
    phone: req.phone ?? null,
    is_active: true
  });

  if (userInsertError) {
    console.error("Users insert error:", userInsertError.message);
  }

  // 5. Marquer la demande comme approuvée
  await supabaseAdmin
    .from("school_registration_requests")
    .update({ status: "approved", processed_at: new Date().toISOString(), university_id: university.id })
    .eq("id", id);

  // 6. Envoyer l'email de bienvenue avec les identifiants en clair
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const loginUrl = `${getSiteUrl()}/login`;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
      to: req.contact_email,
      subject: `Bienvenue sur SamaDepot — ${req.university_name}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
            <tr><td align="center">
              <table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
                <tr><td style="background:#2563eb;padding:24px 32px">
                  <span style="font-size:18px;font-weight:700;color:#fff">SD &nbsp; SamaDepot</span>
                </td></tr>
                <tr><td style="padding:32px;font-size:15px;color:#334155;line-height:1.7">
                  <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a">Bienvenue, ${req.contact_name} !</h2>
                  <p style="margin:0 0 20px;color:#64748b">Votre école <strong style="color:#0f172a">${req.university_name}</strong> est maintenant active sur SamaDepot.</p>

                  <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin:0 0 20px">
                    <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:.05em">Vos identifiants de connexion</p>
                    <table cellpadding="0" cellspacing="0" style="width:100%">
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#64748b;width:130px">Email</td>
                        <td style="padding:5px 0;font-size:14px;font-weight:600;color:#0f172a">${req.contact_email}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#64748b">Mot de passe</td>
                        <td style="padding:5px 0;font-size:16px;font-weight:700;color:#0f172a;font-family:monospace;letter-spacing:1px">${tempPassword}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;font-size:13px;color:#64748b">Rôle</td>
                        <td style="padding:5px 0;font-size:14px;color:#0f172a">Administrateur</td>
                      </tr>
                    </table>
                  </div>

                  <p style="font-size:13px;color:#94a3b8;margin:0 0 20px">Changez votre mot de passe dès votre première connexion depuis les paramètres de votre profil.</p>

                  <a href="${loginUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:13px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
                    Se connecter maintenant →
                  </a>
                </td></tr>
                <tr><td style="padding:16px 32px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8">
                  SamaDepot · ${getSiteUrl()}
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `
    });

    if (emailError) {
      console.error("Resend welcome email error:", JSON.stringify(emailError));
      // On retourne quand même succès (université créée) mais avec le détail de l'erreur email
      return NextResponse.json({
        data: {
          status: "approved",
          universityId: university.id,
          universityName: university.name,
          adminEmail: req.contact_email,
          emailError: emailError.message,
          tempPassword // exposé pour que le superadmin puisse le copier si email échoue
        }
      });
    }

    console.log("Welcome email sent:", emailData?.id, "to:", req.contact_email);
  } else {
    console.error("RESEND_API_KEY manquant — email de bienvenue non envoyé");
  }

  // Toujours retourner tempPassword pour que la modal s'affiche
  return NextResponse.json({
    data: {
      status: "approved",
      universityId: university.id,
      universityName: university.name,
      adminEmail: req.contact_email,
      tempPassword,
      emailSent: Boolean(process.env.RESEND_API_KEY)
    }
  });
}
