import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/env";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig
} from "@/lib/supabase-admin";
import { reviewSubmissionSchema } from "@/lib/validation";

const statusByDecision = {
  validate: "validated",
  grade: "graded",
  return: "returned",
  reject: "rejected"
} as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  if (!["teacher", "admin", "superadmin"].includes(user.role)) {
    return NextResponse.json(
      { error: "Seuls les professeurs et admins peuvent evaluer" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = reviewSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload invalide", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!hasSupabaseConfig() || !hasSupabaseAdminConfig()) {
    return NextResponse.json({
      data: {
        submissionId: id,
        ...parsed.data,
        status: statusByDecision[parsed.data.decision],
        reviewedAt: new Date().toISOString()
      }
    });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: submission, error: submissionError } = await supabaseAdmin
    .from("submissions")
    .select("id,university_id,status,space_id,submission_spaces(teacher_id)")
    .eq("id", id)
    .single();

  if (submissionError || !submission) {
    return NextResponse.json({ error: "Depot introuvable" }, { status: 404 });
  }

  const space = Array.isArray(submission.submission_spaces)
    ? submission.submission_spaces[0]
    : submission.submission_spaces;
  const canReview =
    space?.teacher_id === user.id ||
    user.role === "superadmin" ||
    (user.role === "admin" && submission.university_id === user.universityId);

  if (!canReview) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const nextStatus = statusByDecision[parsed.data.decision];

  await supabaseAdmin.from("reviews").delete().eq("submission_id", id);

  const { data: review, error: reviewError } = await supabaseAdmin
    .from("reviews")
    .insert({
      submission_id: id,
      teacher_id: user.id,
      decision: parsed.data.decision,
      grade: parsed.data.decision === "grade" ? parsed.data.grade : null,
      grade_max: 20,
      comment: parsed.data.comment,
      is_visible: true
    })
    .select("id,decision,grade,grade_max,comment,reviewed_at")
    .single();

  if (reviewError || !review) {
    return NextResponse.json(
      { error: reviewError?.message ?? "Evaluation impossible" },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabaseAdmin
    .from("submissions")
    .update({ status: nextStatus })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  await supabaseAdmin.from("audit_logs").insert({
    user_id: user.id,
    university_id: submission.university_id,
    action: "REVIEW_SUBMISSION",
    resource_type: "submission",
    resource_id: id,
    old_value: { status: submission.status },
    new_value: { status: nextStatus, decision: parsed.data.decision }
  });

  return NextResponse.json({
    data: {
      submissionId: id,
      status: nextStatus,
      ...review
    }
  });
}
