import { NextResponse } from "next/server";
import { hasSupabaseConfig, getSiteUrl } from "@/lib/env";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";
import { hasEmailConfig } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  if (!hasSupabaseConfig() || !hasSupabaseAdminConfig()) {
    return NextResponse.json({ data: { message: "Email envoyé (mode démo)" } });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // Générer le lien via l'API admin (bypasse SMTP Supabase)
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${getSiteUrl()}/reset-password` }
  });

  if (error) {
    console.error("generateLink error:", error.message);
    // Répondre succès même si l'email n'existe pas (sécurité anti-énumération)
    return NextResponse.json({ data: { message: "Email envoyé" } });
  }

  if (!data?.properties?.action_link) {
    console.error("generateLink: no action_link in response");
    return NextResponse.json({ data: { message: "Email envoyé" } });
  }

  const resetLink = data.properties.action_link;

  if (!hasEmailConfig()) {
    console.error("RESEND_API_KEY manquant — impossible d'envoyer l'email de reset");
    return NextResponse.json({ error: "Service email non configuré" }, { status: 500 });
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

  const { data: emailData, error: emailError } = await resend.emails.send({
    from,
    to: email,
    subject: "Réinitialisation de ton mot de passe SamaDepot",
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
          <tr><td align="center">
            <table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
              <tr><td style="background:#2563eb;padding:24px 32px">
                <span style="font-size:18px;font-weight:700;color:#fff">SD &nbsp; SamaDepot</span>
              </td></tr>
              <tr><td style="padding:32px;font-size:15px;color:#334155;line-height:1.6">
                <h2 style="margin:0 0 16px;font-size:20px;color:#0f172a">Réinitialisation du mot de passe</h2>
                <p>Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous :</p>
                <p style="margin:24px 0">
                  <a href="${resetLink}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
                    Réinitialiser mon mot de passe →
                  </a>
                </p>
                <p style="font-size:13px;color:#94a3b8">Ce lien expire dans 24h. Si tu n'as pas fait cette demande, ignore cet email.</p>
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
    console.error("Resend error (reset password):", JSON.stringify(emailError));
    return NextResponse.json(
      { error: `Impossible d'envoyer l'email : ${emailError.message}` },
      { status: 500 }
    );
  }

  console.log("Reset password email sent:", emailData?.id, "to:", email);
  return NextResponse.json({ data: { message: "Email envoyé" } });
}
