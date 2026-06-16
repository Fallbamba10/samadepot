import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSpaces } from "@/lib/data";
import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSpaceSchema } from "@/lib/validation";

export async function GET() {
  const spaces = await getSpaces();
  return NextResponse.json({ data: spaces });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (
    !currentUser ||
    !["teacher", "admin", "superadmin"].includes(currentUser.role)
  ) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createSpaceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload invalide", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      {
        data: {
          id: crypto.randomUUID(),
          ...parsed.data,
          status: "open"
        }
      },
      { status: 201 }
    );
  }

  const input = parsed.data;
  const supabase = await createSupabaseServerClient();
  const insertPayload = {
    university_id: currentUser.universityId,
    teacher_id: currentUser.id,
    title: input.title,
    description: input.description,
    type: input.type,
    target_level: input.targetLevel,
    subject_id: input.subjectId,
    deadline: input.deadline,
    formats_allowed: input.formatsAllowed,
    max_size_mb: input.maxSizeMb,
    allow_late: input.allowLate ?? false,
    allow_resubmit: input.allowResubmit ?? true,
    is_active: true
  };

  let { data, error } = await supabase
    .from("submission_spaces")
    .insert(insertPayload)
    .select("id,title,type,deadline")
    .single();

  if (error && error.message.includes("subject_id")) {
    const { subject_id, ...fallbackPayload } = insertPayload;
    const retry = await supabase
      .from("submission_spaces")
      .insert(fallbackPayload)
      .select("id,title,type,deadline")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data?.id && input.classIds && input.classIds.length > 0) {
    const { createSupabaseAdminClient, hasSupabaseAdminConfig } = await import(
      "@/lib/supabase-admin"
    );

    if (hasSupabaseAdminConfig()) {
      const supabaseAdmin = createSupabaseAdminClient();
      await supabaseAdmin.from("submission_space_classes").insert(
        input.classIds.map((classId) => ({
          university_id: currentUser.universityId,
          space_id: data.id,
          class_id: classId
        }))
      );
    }
  }

  return NextResponse.json(
    {
      data
    },
    { status: 201 }
  );
}
