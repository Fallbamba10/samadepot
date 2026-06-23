import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";
import { sendPlanExpiryWarningEmail } from "@/lib/email";

// Appelé par Vercel Cron chaque jour à 9h UTC
// Envoie un email de préavis aux admins dont le plan expire dans 7 jours
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: "Admin non configuré" }, { status: 500 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ skipped: "RESEND_API_KEY absent" });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // Universités dont le plan expire dans les 7 prochains jours (et pas encore expirées)
  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: expiring, error } = await supabaseAdmin
    .from("universities")
    .select("id, name, plan, plan_expires_at")
    .neq("plan", "free")
    .not("plan_expires_at", "is", null)
    .gt("plan_expires_at", now.toISOString())
    .lte("plan_expires_at", in7days.toISOString());

  if (error) {
    console.error("Cron plan-expiry-warning error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!expiring || expiring.length === 0) {
    return NextResponse.json({ sent: 0, message: "Aucun plan en cours d'expiration" });
  }

  // Récupérer les admins de chaque université
  const uniIds = expiring.map((u: any) => u.id);
  const { data: admins } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name, university_id")
    .in("university_id", uniIds)
    .eq("role", "admin");

  const adminsByUni = new Map<string, { email: string; name: string }[]>();
  for (const admin of admins ?? []) {
    const existing = adminsByUni.get(admin.university_id) ?? [];
    adminsByUni.set(admin.university_id, [...existing, { email: admin.email, name: admin.full_name ?? "Administrateur" }]);
  }

  let totalSent = 0;

  for (const uni of expiring as any[]) {
    const uniAdmins = adminsByUni.get(uni.id) ?? [];
    if (uniAdmins.length === 0) continue;

    const expiresAt = new Date(uni.plan_expires_at);
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const expiresAtFormatted = expiresAt.toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric"
    });

    await Promise.allSettled(
      uniAdmins.map(({ email, name }) =>
        sendPlanExpiryWarningEmail({
          adminEmail: email,
          adminName: name,
          universityName: uni.name,
          plan: uni.plan,
          expiresAt: expiresAtFormatted,
          daysLeft
        })
      )
    );

    totalSent += uniAdmins.length;
    console.log(`Plan expiry warning: ${uni.name} (${uni.plan}, J-${daysLeft}) → ${uniAdmins.length} admin(s) notifié(s)`);
  }

  return NextResponse.json({
    sent: totalSent,
    universities: expiring.length,
    message: `${totalSent} email(s) envoyé(s) pour ${expiring.length} université(s)`
  });
}
