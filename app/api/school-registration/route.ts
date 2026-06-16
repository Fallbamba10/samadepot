import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";
import { sendWelcomeEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/env";

export async function POST(request: Request) {
  // Supporte form POST (landing page) et JSON (API)
  const contentType = request.headers.get("content-type") ?? "";
  let universityName = "", emailDomain = "", contactName = "", contactEmail = "", phone = "", studentsCount = "";

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    universityName = String(formData.get("universityName") ?? "").trim();
    emailDomain    = String(formData.get("emailDomain") ?? "").trim().toLowerCase();
    contactName    = String(formData.get("contactName") ?? "").trim();
    contactEmail   = String(formData.get("contactEmail") ?? "").trim().toLowerCase();
    phone          = String(formData.get("phone") ?? "").trim();
    studentsCount  = String(formData.get("studentsCount") ?? "");
  } else {
    const body = await request.json();
    universityName = String(body.universityName ?? "").trim();
    emailDomain    = String(body.emailDomain ?? "").trim().toLowerCase();
    contactName    = String(body.contactName ?? "").trim();
    contactEmail   = String(body.contactEmail ?? "").trim().toLowerCase();
    phone          = String(body.phone ?? "").trim();
    studentsCount  = String(body.studentsCount ?? "");
  }

  if (!universityName || !emailDomain || !contactName || !contactEmail) {
    const redirectUrl = new URL("/?error=missing_fields", getSiteUrl());
    return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
  }

  if (hasSupabaseAdminConfig()) {
    const supabaseAdmin = createSupabaseAdminClient();
    void supabaseAdmin.from("school_registration_requests").insert({
      university_name: universityName,
      email_domain: emailDomain,
      contact_name: contactName,
      contact_email: contactEmail,
      phone: phone || null,
      students_count: studentsCount || null,
      status: "pending"
    }).then(() => null, () => null); // table optionnelle — ne bloque pas si elle n'existe pas

    // Email de confirmation à l'école
    sendWelcomeEmail({
      email: contactEmail,
      fullName: contactName,
      universityName,
    }).catch(() => null);

    // Notifie le superadmin (toi)
    const superadminEmail = process.env.SUPERADMIN_EMAIL;
    if (superadminEmail) {
      const { Resend } = await import("resend");
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        resend.emails.send({
          from: process.env.EMAIL_FROM ?? "SamaDepot <noreply@samadepot.sn>",
          to: superadminEmail,
          subject: `🏫 Nouvelle demande d'inscription — ${universityName}`,
          html: `<p><strong>${universityName}</strong> (${emailDomain}) souhaite rejoindre SamaDepot.</p>
                 <p>Contact : ${contactName} — ${contactEmail} — ${phone}</p>
                 <p>Étudiants estimés : ${studentsCount}</p>
                 <p><a href="${getSiteUrl()}/superadmin">Voir dans le dashboard →</a></p>`
        }).catch(() => null);
      }
    }
  }

  // Redirige vers la page de confirmation
  return NextResponse.redirect(new URL("/?registered=1", getSiteUrl()).toString(), { status: 303 });
}
