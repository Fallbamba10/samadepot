import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";
import { getSiteUrl } from "@/lib/env";

export async function POST(request: Request) {
  let universityName = "", emailDomain = "", contactName = "", contactEmail = "", phone = "", studentsCount = "";

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json();
    universityName = String(body.universityName ?? "").trim();
    emailDomain    = String(body.emailDomain    ?? "").trim().toLowerCase();
    contactName    = String(body.contactName    ?? "").trim();
    contactEmail   = String(body.contactEmail   ?? "").trim().toLowerCase();
    phone          = String(body.phone          ?? "").trim();
    studentsCount  = String(body.studentsCount  ?? "");
  } else {
    const formData = await request.formData();
    universityName = String(formData.get("universityName") ?? "").trim();
    emailDomain    = String(formData.get("emailDomain")    ?? "").trim().toLowerCase();
    contactName    = String(formData.get("contactName")    ?? "").trim();
    contactEmail   = String(formData.get("contactEmail")   ?? "").trim().toLowerCase();
    phone          = String(formData.get("phone")          ?? "").trim();
    studentsCount  = String(formData.get("studentsCount")  ?? "");
  }

  if (!universityName || !emailDomain || !contactName || !contactEmail) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  if (hasSupabaseAdminConfig()) {
    const supabaseAdmin = createSupabaseAdminClient();

    // Insérer la demande (la table doit exister — voir supabase/school-registrations.sql)
    const { error: insertError } = await supabaseAdmin.from("school_registration_requests").insert({
      university_name: universityName,
      email_domain:    emailDomain,
      contact_name:    contactName,
      contact_email:   contactEmail,
      phone:           phone || null,
      students_count:  studentsCount || null,
      status:          "pending"
    });

    if (insertError) {
      console.error("school_registration insert error:", insertError.message);
      // On répond succès quand même pour ne pas bloquer l'utilisateur
      // (ex : table inexistante en mode dev)
    }

    // Email de confirmation à l'école
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      resend.emails.send({
        from: process.env.EMAIL_FROM ?? "SamaDepot <noreply@samadepot.sn>",
        to: contactEmail,
        subject: "Demande d'inscription SamaDepot reçue",
        html: `
          <p>Bonjour ${contactName},</p>
          <p>Nous avons bien reçu votre demande d'inscription pour <strong>${universityName}</strong>.</p>
          <p>Notre équipe vous contactera sous 24h pour finaliser votre accès.</p>
          <p>L'équipe SamaDepot</p>
        `
      }).catch(() => null);

      // Notifier le superadmin
      const superadminEmail = process.env.SUPERADMIN_EMAIL;
      if (superadminEmail) {
        resend.emails.send({
          from: process.env.EMAIL_FROM ?? "SamaDepot <noreply@samadepot.sn>",
          to: superadminEmail,
          subject: `🏫 Nouvelle demande — ${universityName}`,
          html: `
            <p><strong>${universityName}</strong> (${emailDomain}) souhaite rejoindre SamaDepot.</p>
            <p>Contact : ${contactName} — ${contactEmail}${phone ? ` — ${phone}` : ""}</p>
            <p>Étudiants estimés : ${studentsCount || "non renseigné"}</p>
            <p><a href="${getSiteUrl()}/superadmin">Traiter la demande →</a></p>
          `
        }).catch(() => null);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
