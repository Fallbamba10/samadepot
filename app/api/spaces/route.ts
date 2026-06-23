import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSpaces } from "@/lib/data";
import { hasSupabaseConfig, getSiteUrl } from "@/lib/env";
import { checkPlanLimit } from "@/lib/plans";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSpaceSchema } from "@/lib/validation";
import type { SupabaseClient } from "@supabase/supabase-js";

async function sendSpaceNotificationEmails({
  supabaseAdmin,
  classIds,
  space,
  teacherName,
  universityName,
  deadline
}: {
  supabaseAdmin: SupabaseClient;
  classIds: string[];
  space: { id: string; title: string; type: string };
  teacherName: string;
  universityName: string;
  deadline: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  // Récupérer les emails des étudiants inscrits dans ces classes
  const { data: memberships } = await supabaseAdmin
    .from("class_students")
    .select("users(email, full_name)")
    .in("class_id", classIds);

  if (!memberships || memberships.length === 0) return;

  const seen = new Set<string>();
  const recipients: { email: string; name: string }[] = [];
  for (const m of memberships) {
    const user = Array.isArray(m.users) ? m.users[0] : m.users;
    if (user?.email && !seen.has(user.email)) {
      seen.add(user.email);
      recipients.push({ email: user.email, name: user.full_name ?? "Étudiant" });
    }
  }

  if (recipients.length === 0) return;

  const deadlineFormatted = new Date(deadline).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short"
  });
  const spaceUrl = `${getSiteUrl()}/spaces/${space.id}/submit`;
  const typeLabel: Record<string, string> = {
    devoir: "Devoir", tp: "TP", examen: "Examen", projet: "Projet", rapport: "Rapport"
  };

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Envoi en batch (Resend limite à 100/req, on découpe si nécessaire)
  const BATCH = 50;
  for (let i = 0; i < recipients.length; i += BATCH) {
    const batch = recipients.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(({ email, name }) =>
        resend.emails.send({
          from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
          to: email,
          subject: `Nouveau dépôt ouvert : ${space.title} — ${universityName}`,
          html: `
            <!DOCTYPE html>
            <html lang="fr">
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px">
                <tr><td align="center">
                  <table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
                    <tr><td style="background:#2563eb;padding:20px 28px">
                      <span style="font-size:16px;font-weight:700;color:#fff">SD &nbsp; SamaDepot</span>
                    </td></tr>
                    <tr><td style="padding:28px;font-size:15px;color:#334155;line-height:1.6">
                      <p style="margin:0 0 6px;font-size:13px;color:#64748b">Bonjour ${name},</p>
                      <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a">Un nouveau dépôt est ouvert</h2>

                      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px;margin:0 0 20px">
                        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:.05em">
                          ${typeLabel[space.type] ?? space.type}
                        </p>
                        <p style="margin:0 0 10px;font-size:16px;font-weight:700;color:#0f172a">${space.title}</p>
                        <table cellpadding="0" cellspacing="0" style="width:100%">
                          <tr>
                            <td style="padding:3px 0;font-size:13px;color:#64748b;width:110px">Professeur</td>
                            <td style="padding:3px 0;font-size:13px;color:#0f172a;font-weight:600">${teacherName}</td>
                          </tr>
                          <tr>
                            <td style="padding:3px 0;font-size:13px;color:#64748b">Date limite</td>
                            <td style="padding:3px 0;font-size:13px;color:#dc2626;font-weight:700">${deadlineFormatted}</td>
                          </tr>
                        </table>
                      </div>

                      <a href="${spaceUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
                        Déposer mon travail →
                      </a>

                      <p style="margin:20px 0 0;font-size:12px;color:#94a3b8">
                        Tu reçois cet email car tu es inscrit(e) à ${universityName} sur SamaDepot.
                      </p>
                    </td></tr>
                    <tr><td style="padding:14px 28px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8">
                      SamaDepot · ${getSiteUrl()}
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
          `
        })
      )
    );
  }

  console.log(`Space notification: ${recipients.length} emails envoyés pour "${space.title}"`);
}

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

  // Vérification limite du plan
  if (currentUser.role !== "superadmin") {
    const adminClient = createSupabaseAdminClient();
    const limitCheck = await checkPlanLimit(adminClient, currentUser.universityId, "spaces");
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.error, upgrade: limitCheck.upgrade }, { status: 403 });
    }
  }

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

      // Notifier les étudiants des classes concernées par email (non-bloquant)
      sendSpaceNotificationEmails({
        supabaseAdmin,
        classIds: input.classIds,
        space: data,
        teacherName: currentUser.fullName,
        universityName: currentUser.universityName,
        deadline: input.deadline
      }).catch((err) => console.error("Space notification email error:", err));
    }
  }

  return NextResponse.json({ data }, { status: 201 });
}
