import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { hasSupabaseConfig } from "@/lib/env";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await request.json();
  const newPassword = String(body.newPassword ?? "");

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Minimum 8 caractères" }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ data: { updated: true } });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data: { updated: true } });
}
