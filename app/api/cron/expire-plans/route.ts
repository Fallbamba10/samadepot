import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";

// Appelé par Vercel Cron chaque jour à 1h du matin
// Rétrograde les universités dont le plan payant a expiré vers le plan gratuit
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

  const supabaseAdmin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  // Universités dont le plan est payant, plan_expires_at est passé
  const { data: expired, error } = await supabaseAdmin
    .from("universities")
    .select("id, name, plan, plan_expires_at")
    .neq("plan", "free")
    .not("plan_expires_at", "is", null)
    .lt("plan_expires_at", now);

  if (error) {
    console.error("Cron expire-plans error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!expired || expired.length === 0) {
    return NextResponse.json({ downgraded: 0, message: "Aucun plan expiré" });
  }

  const ids = expired.map((u: any) => u.id);

  const { error: updateError } = await supabaseAdmin
    .from("universities")
    .update({ plan: "free", plan_expires_at: null })
    .in("id", ids);

  if (updateError) {
    console.error("Cron expire-plans update error:", updateError.message);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  for (const uni of expired as any[]) {
    console.log(`Plan expiré: ${uni.name} (${uni.plan} → free)`);
  }

  return NextResponse.json({
    downgraded: expired.length,
    universities: (expired as any[]).map((u: any) => ({ id: u.id, name: u.name, was: u.plan })),
    message: `${expired.length} université(s) rétrogradée(s) vers le plan gratuit`
  });
}
