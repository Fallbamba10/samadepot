import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/env";
import { submissions } from "@/lib/mock-data";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig
} from "@/lib/supabase-admin";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }
  return NextResponse.json({ data: submissions });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  if (!["student", "superadmin"].includes(currentUser.role)) {
    return NextResponse.json(
      { error: "Seuls les etudiants peuvent deposer un fichier" },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const spaceId = String(formData.get("spaceId") ?? "");
  const studentComment = optionalString(formData.get("studentComment"));
  const file = formData.get("file");

  if (!spaceId || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Espace ou fichier manquant" },
      { status: 400 }
    );
  }

  if (!hasSupabaseConfig() || !hasSupabaseAdminConfig()) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = await sha256(buffer);
    const year = new Date().getFullYear();
    const seq = Math.floor(Math.random() * 90000 + 10000);
    return NextResponse.json(
      {
        data: {
          id: `SD-${year}-${seq}`,
          status: "received",
          file_hash: hash,
          file_name: file.name,
          submitted_at: new Date().toISOString()
        }
      },
      { status: 201 }
    );
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: space, error: spaceError } = await supabaseAdmin
    .from("submission_spaces")
    .select("id,university_id,deadline,formats_allowed,max_size_mb,allow_late,is_active")
    .eq("id", spaceId)
    .single();

  if (spaceError || !space) {
    return NextResponse.json({ error: "Espace introuvable" }, { status: 404 });
  }

  if (!space.is_active) {
    return NextResponse.json({ error: "Espace ferme" }, { status: 400 });
  }

  if (
    currentUser.role !== "superadmin" &&
    space.university_id !== currentUser.universityId
  ) {
    return NextResponse.json({ error: "Espace hors universite" }, { status: 403 });
  }

  const sizeMb = Number((file.size / 1024 / 1024).toFixed(2));
  if (sizeMb > Number(space.max_size_mb)) {
    return NextResponse.json(
      { error: `Fichier trop volumineux. Limite: ${space.max_size_mb} Mo` },
      { status: 400 }
    );
  }

  const extension = getExtension(file.name);
  const allowedFormats = (space.formats_allowed ?? []).map((item: string) =>
    item.toLowerCase()
  );

  if (extension && allowedFormats.length > 0 && !allowedFormats.includes(extension)) {
    return NextResponse.json(
      { error: `Format .${extension} non autorise` },
      { status: 400 }
    );
  }

  const submittedAt = new Date();
  const deadline = new Date(space.deadline);
  const isLate = submittedAt > deadline;

  if (isLate && !space.allow_late) {
    return NextResponse.json(
      { error: "La deadline est depassee pour cet espace" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = await sha256(buffer);
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const storagePath = `${space.university_id}/${space.id}/${currentUser.id}/${crypto.randomUUID()}-${safeName}`;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "submissions";

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: submission, error: submissionError } = await supabaseAdmin
    .from("submissions")
    .insert({
      space_id: space.id,
      student_id: currentUser.id,
      university_id: space.university_id,
      file_name: file.name,
      file_url: storagePath,
      file_size_mb: sizeMb,
      file_mime_type: file.type || "application/octet-stream",
      file_hash: hash,
      status: isLate ? "late" : "received",
      is_late: isLate,
      student_comment: studentComment
    })
    .select("id,status,submitted_at,file_hash")
    .single();

  if (submissionError) {
    await supabaseAdmin.storage.from(bucket).remove([storagePath]);
    return NextResponse.json({ error: submissionError.message }, { status: 400 });
  }

  return NextResponse.json(
    {
      data: submission
    },
    { status: 201 }
  );
}

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

function getExtension(fileName: string) {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.at(-1) : "";
}

async function sha256(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}
