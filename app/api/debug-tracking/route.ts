import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const spaceId = req.nextUrl.searchParams.get("space_id");
  if (!spaceId) return NextResponse.json({ error: "space_id requis" }, { status: 400 });

  const supabaseAdmin = createSupabaseAdminClient();

  const [classLinksResult, submissionsResult] = await Promise.all([
    supabaseAdmin
      .from("submission_space_classes")
      .select("class_id")
      .eq("space_id", spaceId),
    supabaseAdmin
      .from("submissions")
      .select("id,student_id,status")
      .eq("space_id", spaceId),
  ]);

  const classIds = (classLinksResult.data ?? []).map((l: any) => l.class_id);

  const { data: memberships, error: memberError } = await supabaseAdmin
    .from("class_students")
    .select("student_id,users(id,full_name)")
    .in("class_id", classIds.length > 0 ? classIds : ["00000000-0000-0000-0000-000000000000"]);

  const subMap: Record<string, any> = {};
  for (const s of submissionsResult.data ?? []) {
    if (!subMap[s.student_id]) subMap[s.student_id] = s;
  }

  const students = (memberships ?? []).map((m: any) => {
    const u = Array.isArray(m.users) ? m.users[0] : m.users;
    return {
      student_id_in_class_students: m.student_id,
      user_id_from_join: u?.id,
      full_name: u?.full_name,
      found_in_submissions: !!subMap[u?.id],
    };
  });

  return NextResponse.json({
    space_id: spaceId,
    class_ids: classIds,
    class_links_error: classLinksResult.error?.message,
    member_error: memberError?.message,
    submissions: submissionsResult.data,
    submissions_error: submissionsResult.error?.message,
    students,
    sub_map_keys: Object.keys(subMap),
  });
}
