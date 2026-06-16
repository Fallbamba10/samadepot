import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/env";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig
} from "@/lib/supabase-admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  if (!hasSupabaseConfig() || !hasSupabaseAdminConfig()) {
    const { id } = await params;
    return NextResponse.redirect(new URL(`/submissions/${id}`, request.url));
  }

  const { id } = await params;
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: submission, error } = await supabaseAdmin
    .from("submissions")
    .select(
      "id,file_url,file_name,student_id,university_id,space_id,submission_spaces(teacher_id)"
    )
    .eq("id", id)
    .single();

  if (error || !submission) {
    return NextResponse.json({ error: "Depot introuvable" }, { status: 404 });
  }

  const space = Array.isArray(submission.submission_spaces)
    ? submission.submission_spaces[0]
    : submission.submission_spaces;
  const canDownload =
    submission.student_id === user.id ||
    space?.teacher_id === user.id ||
    user.role === "superadmin" ||
    (user.role === "admin" && submission.university_id === user.universityId);

  if (!canDownload) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "submissions";
  const expirySeconds = Number(process.env.SIGNED_URL_EXPIRY_SECONDS ?? 900);
  const { data, error: signedUrlError } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(submission.file_url, expirySeconds, {
      download: submission.file_name
    });

  if (signedUrlError || !data?.signedUrl) {
    return NextResponse.json(
      { error: signedUrlError?.message ?? "Lien de telechargement indisponible" },
      { status: 400 }
    );
  }

  return NextResponse.redirect(data.signedUrl);
}
