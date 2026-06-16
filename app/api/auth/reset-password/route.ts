import { NextResponse } from "next/server";
import { hasSupabaseConfig, getSiteUrl } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ data: { message: "Email envoyé (mode démo)" } });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/reset-password`
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: { message: "Email envoyé" } });
}
