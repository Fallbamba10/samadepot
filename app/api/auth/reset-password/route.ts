import { NextResponse } from "next/server";
import { hasSupabaseConfig, getSiteUrl } from "@/lib/env";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";

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
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/login?reset=1`
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: { message: "Email envoyé" } });
}
