import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paytech";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// PayTech envoie un POST IPN quand le paiement est confirmé
export async function POST(request: NextRequest) {
  const body = await request.formData().catch(() => null);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  const payload = {
    type_event:        body.get("type_event") as string,
    ref_command:       body.get("ref_command") as string,
    amount:            Number(body.get("item_price") ?? 0),
    api_key_sha256:    body.get("api_key_sha256") as string,
    api_secret_sha256: body.get("api_secret_sha256") as string,
    custom_field:      body.get("custom_field") as string,
  };

  // Vérifier la signature
  if (!verifyWebhookSignature(payload)) {
    return NextResponse.json({ ok: false, error: "Signature invalide" }, { status: 401 });
  }

  if (payload.type_event !== "sale_complete") {
    // Annulation ou autre — on marque comme annulé
    if (payload.ref_command) {
      const supabaseAdmin = createSupabaseAdminClient();
      await supabaseAdmin
        .from("payment_orders")
        .update({ status: "cancelled" })
        .eq("ref_command", payload.ref_command);
    }
    return NextResponse.json({ ok: true });
  }

  // Paiement confirmé — extraire university_id et plan depuis custom_field
  let universityId: string | null = null;
  let plan: string | null = null;

  try {
    const custom = JSON.parse(payload.custom_field);
    universityId = custom.university_id;
    plan = custom.plan;
  } catch {
    return NextResponse.json({ ok: false, error: "custom_field invalide" }, { status: 400 });
  }

  if (!universityId || !plan) {
    return NextResponse.json({ ok: false, error: "Données manquantes" }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // Mettre à jour le plan de l'université
  await supabaseAdmin
    .from("universities")
    .update({ plan })
    .eq("id", universityId);

  // Marquer la commande comme payée
  await supabaseAdmin
    .from("payment_orders")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("ref_command", payload.ref_command);

  return NextResponse.json({ ok: true });
}
