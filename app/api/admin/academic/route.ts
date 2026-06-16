import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig
} from "@/lib/supabase-admin";
import {
  assignStudentClassSchema,
  assignTeacherSchema,
  createAcademicClassSchema,
  createSubjectSchema
} from "@/lib/validation";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !["admin", "superadmin"].includes(currentUser.role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "Supabase admin non configure" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const action = String(body.action ?? "");
  const supabaseAdmin = createSupabaseAdminClient();

  if (action === "create_class") {
    const parsed = createAcademicClassSchema.safeParse(body);
    if (!parsed.success) {
      return invalidPayload(parsed.error.flatten());
    }

    const { data, error } = await supabaseAdmin
      .from("academic_classes")
      .insert({
        university_id: currentUser.universityId,
        name: parsed.data.name,
        code: parsed.data.code,
        level: parsed.data.level,
        academic_year: parsed.data.academicYear ?? "2025-2026"
      })
      .select("id,name,code")
      .single();

    return result(data, error);
  }

  if (action === "create_subject") {
    const parsed = createSubjectSchema.safeParse(body);
    if (!parsed.success) {
      return invalidPayload(parsed.error.flatten());
    }

    const { data, error } = await supabaseAdmin
      .from("subjects")
      .insert({
        university_id: currentUser.universityId,
        name: parsed.data.name,
        code: parsed.data.code
      })
      .select("id,name,code")
      .single();

    return result(data, error);
  }

  if (action === "assign_student") {
    const parsed = assignStudentClassSchema.safeParse(body);
    if (!parsed.success) {
      return invalidPayload(parsed.error.flatten());
    }

    const { data, error } = await supabaseAdmin
      .from("class_students")
      .insert({
        university_id: currentUser.universityId,
        student_id: parsed.data.studentId,
        class_id: parsed.data.classId
      })
      .select("id")
      .single();

    return result(data, error);
  }

  if (action === "assign_teacher") {
    const parsed = assignTeacherSchema.safeParse(body);
    if (!parsed.success) {
      return invalidPayload(parsed.error.flatten());
    }

    const { data, error } = await supabaseAdmin
      .from("teaching_assignments")
      .insert({
        university_id: currentUser.universityId,
        teacher_id: parsed.data.teacherId,
        subject_id: parsed.data.subjectId,
        class_id: parsed.data.classId
      })
      .select("id")
      .single();

    return result(data, error);
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}

function invalidPayload(issues: unknown) {
  return NextResponse.json(
    { error: "Payload invalide", issues },
    { status: 400 }
  );
}

function result(data: unknown, error: { message: string } | null) {
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
