import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { initiatePayment, generateRef, PLAN_PRICES, type PlanId } from "@/lib/paytech";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !["admin", "superadmin"].includes(currentUser.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const plan = body.plan as PlanId;

  if (!plan || !PLAN_PRICES[plan]) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: uni } = await supabaseAdmin
    .from("universities")
    .select("id, name")
    .eq("id", currentUser.universityId)
    .single();

  if (!uni) {
    return NextResponse.json({ error: "Université introuvable" }, { status: 404 });
  }

  const refCommand = generateRef(uni.id);

  // Sauvegarder la commande en attente
  await supabaseAdmin.from("payment_orders").insert({
    ref_command:    refCommand,
    university_id:  uni.id,
    plan,
    amount_fcfa:    PLAN_PRICES[plan].priceFcfa,
    status:         "pending",
  });

  const result = await initiatePayment({
    plan,
    universityId:   uni.id,
    universityName: uni.name,
    refCommand,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ redirectUrl: result.redirectUrl });
}
