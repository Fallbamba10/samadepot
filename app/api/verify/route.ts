import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")?.trim().toUpperCase();

  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("v_submissions_full")
    .select(
      "id,student_name,student_email,student_number,file_name,space_title,space_type,submitted_at,deadline,status,file_size_mb,file_hash,version,is_late,grade,grade_max"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Recepisse introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    id: data.id,
    student: data.student_name ?? "Etudiant",
    studentEmail: data.student_email ?? null,
    studentNumber: data.student_number ?? null,
    fileName: data.file_name,
    spaceTitle: data.space_title,
    spaceType: data.space_type ?? "Depot",
    submittedAt: new Date(data.submitted_at).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short"
    }),
    deadline: data.deadline
      ? new Date(data.deadline).toLocaleString("fr-FR", {
          dateStyle: "medium",
          timeStyle: "short"
        })
      : null,
    status: data.status,
    sizeMb: Number(data.file_size_mb),
    hash: data.file_hash,
    version: Number(data.version ?? 1),
    isLate: Boolean(data.is_late),
    grade: data.grade ? `${data.grade}/${data.grade_max}` : null
  });
}
