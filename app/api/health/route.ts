import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/env";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig
} from "@/lib/supabase-admin";

export async function GET() {
  const checks = {
    app: true,
    supabasePublic: hasSupabaseConfig(),
    supabaseAdmin: hasSupabaseAdminConfig(),
    storageBucket: false
  };

  if (checks.supabaseAdmin) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "submissions";
    const supabaseAdmin = createSupabaseAdminClient();
    const { data } = await supabaseAdmin.storage.listBuckets();
    checks.storageBucket = Boolean(data?.some((item) => item.name === bucket));
  }

  const ok = Object.values(checks).every(Boolean);

  return NextResponse.json({
    ok,
    service: "samadepot",
    version: "0.1.0",
    checks
  }, { status: ok ? 200 : 503 });
}
