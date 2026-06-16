import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { submissions as mockSubmissions } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")?.trim().toUpperCase();

  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    const found = mockSubmissions.find((s) => s.id === id);
    if (!found) {
      return NextResponse.json({ error: "Recepisse introuvable" }, { status: 404 });
    }
    return NextResponse.json({
      id: found.id,
      student: found.student,
      studentEmail: found.studentEmail ?? null,
      studentNumber: found.studentNumber ?? null,
      fileName: found.fileName,
      spaceTitle: found.spaceTitle,
      spaceType: found.spaceType ?? "Depot",
      submittedAt: found.submittedAt,
      deadline: found.deadline ?? null,
      status: found.status,
      sizeMb: found.sizeMb,
      hash: found.hash,
      version: found.version ?? 1,
      isLate: found.isLate ?? false,
      grade: found.grade ?? null
    });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("v_submissions_full")
    .select("id,student_name,student_email,student_number,file_name,space_title,space_type,submitted_at,deadline,status,file_size_mb,file_hash,version,is_late,grade,grade_max")
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
    submittedAt: new Date(data.submitted_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }),
    deadline: data.deadline ? new Date(data.deadline).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }) : null,
    status: data.status,
    sizeMb: Number(data.file_size_mb),
    hash: data.file_hash,
    version: Number(data.version ?? 1),
    isLate: Boolean(data.is_late),
    grade: data.grade ? `${data.grade}/${data.grade_max}` : null
  });
}
