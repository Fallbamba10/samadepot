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

  // Récupérer la demande
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

  if (action === "reject") {
    await supabaseAdmin
      .from("school_registration_requests")
      .update({ status: "rejected", processed_at: new Date().toISOString(), reject_reason: rejectReason })
      .eq("id", id);

    // Email de rejet
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "SamaDepot <noreply@samadepot.sn>",
        to: req.contact_email,
        subject: "Votre demande d'inscription SamaDepot",
        html: `
          <p>Bonjour ${req.contact_name},</p>
          <p>Nous avons bien reçu votre demande d'inscription pour <strong>${req.university_name}</strong>.</p>
          <p>Après examen, nous ne sommes pas en mesure de donner suite à cette demande pour le moment${rejectReason ? ` : ${rejectReason}` : ""}.</p>
          <p>N'hésitez pas à nous recontacter si votre situation évolue.</p>
          <p>L'équipe SamaDepot</p>
        `
      }).catch(() => null);
    }

    return NextResponse.json({ data: { status: "rejected" } });
  }

  // Approuver : créer l'université + compte admin
  const slug = req.university_name
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  // Créer l'université
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
    return NextResponse.json({ error: `Création université échouée: ${uniError?.message}` }, { status: 500 });
  }

  // Créer le compte admin via Supabase Auth
  const tempPassword = Array.from({ length: 12 }, () =>
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"[
      Math.floor(Math.random() * 67)
    ]
  ).join("");

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: req.contact_email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: req.contact_name,
      role: "admin",
      university_id: university.id
    }
  });

  if (authError || !authUser.user) {
    // Rollback université
    await supabaseAdmin.from("universities").delete().eq("id", university.id);
    return NextResponse.json({ error: `Création compte échouée: ${authError?.message}` }, { status: 500 });
  }

  // Insérer dans la table users
  await supabaseAdmin.from("users").insert({
    id: authUser.user.id,
    email: req.contact_email,
    full_name: req.contact_name,
    role: "admin",
    university_id: university.id,
    phone: req.phone ?? null,
    is_active: true
  });

  // Mettre à jour la demande
  await supabaseAdmin
    .from("school_registration_requests")
    .update({
      status: "approved",
      processed_at: new Date().toISOString(),
      university_id: university.id
    })
    .eq("id", id);

  // Générer un lien de réinitialisation de mot de passe
  let setupLink = `${getSiteUrl()}/login`;
  try {
    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: req.contact_email,
      options: { redirectTo: `${getSiteUrl()}/reset-password` }
    });
    if (linkData?.properties?.action_link) {
      setupLink = linkData.properties.action_link;
    }
  } catch {
    // lien de fallback
  }

  // Email de bienvenue avec credentials
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "SamaDepot <noreply@samadepot.sn>",
      to: req.contact_email,
      subject: `🎉 Bienvenue sur SamaDepot — ${req.university_name}`,
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
                <tr><td style="padding:32px;font-size:15px;color:#334155;line-height:1.6">
                  <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a">Bienvenue, ${req.contact_name} !</h2>
                  <p style="margin:0 0 16px;color:#64748b">Votre établissement <strong>${req.university_name}</strong> est maintenant sur SamaDepot.</p>

                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:.05em">Vos accès administrateur</p>
                    <p style="margin:4px 0;font-size:14px;color:#334155"><strong>Email :</strong> ${req.contact_email}</p>
                    <p style="margin:4px 0;font-size:14px;color:#334155"><strong>Rôle :</strong> Administrateur</p>
                  </div>

                  <p>Pour activer votre compte et définir votre mot de passe, cliquez ci-dessous :</p>
                  <p style="margin:24px 0">
                    <a href="${setupLink}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
                      Configurer mon compte →
                    </a>
                  </p>

                  <p style="font-size:13px;color:#94a3b8">Ce lien est valable 24h. En tant qu'administrateur, vous pourrez ensuite créer les comptes professeurs et importer vos étudiants.</p>
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
    }).catch(() => null);
  }

  return NextResponse.json({
    data: {
      status: "approved",
      universityId: university.id,
      universityName: university.name,
      adminEmail: req.contact_email
    }
  });
}
