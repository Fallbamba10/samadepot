import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";
import { getSiteUrl } from "@/lib/env";

// Appelé par Vercel Cron toutes les heures
// Envoie un rappel aux étudiants qui n'ont pas encore déposé,
// pour les espaces dont la deadline est dans les prochaines 24h.
export async function GET(request: Request) {
  // Vérifier le secret cron pour éviter les appels non autorisés
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: "Admin non configuré" }, { status: 500 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ skipped: "RESEND_API_KEY absent" });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // Espaces dont la deadline est dans les 24 prochaines heures et pas encore expirés
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: spaces, error: spacesError } = await supabaseAdmin
    .from("submission_spaces")
    .select("id,title,type,deadline,teacher_id,university_id,universities(name),users!teacher_id(full_name)")
    .eq("is_active", true)
    .gt("deadline", now.toISOString())
    .lte("deadline", in24h.toISOString());

  if (spacesError) {
    console.error("Cron deadline-reminder spaces error:", spacesError.message);
    return NextResponse.json({ error: spacesError.message }, { status: 500 });
  }

  if (!spaces || spaces.length === 0) {
    return NextResponse.json({ sent: 0, message: "Aucun espace en deadline prochaine" });
  }

  const spaceIds = spaces.map((s: any) => s.id);

  // Pour chaque espace, récupérer les étudiants des classes associées
  const [classLinksResult, submissionsResult] = await Promise.all([
    supabaseAdmin
      .from("submission_space_classes")
      .select("space_id, class_id")
      .in("space_id", spaceIds),
    supabaseAdmin
      .from("submissions")
      .select("space_id, student_id")
      .in("space_id", spaceIds)
  ]);

  const classIdsBySpace = new Map<string, string[]>();
  for (const link of classLinksResult.data ?? []) {
    const existing = classIdsBySpace.get(link.space_id) ?? [];
    classIdsBySpace.set(link.space_id, [...existing, link.class_id]);
  }

  // Étudiants ayant déjà déposé par espace
  const submittedBySpace = new Map<string, Set<string>>();
  for (const sub of submissionsResult.data ?? []) {
    if (!submittedBySpace.has(sub.space_id)) submittedBySpace.set(sub.space_id, new Set());
    submittedBySpace.get(sub.space_id)!.add(sub.student_id);
  }

  // Récupérer tous les class_ids concernés
  const allClassIds = [...new Set([...classIdsBySpace.values()].flat())];
  if (allClassIds.length === 0) {
    return NextResponse.json({ sent: 0, message: "Aucune classe liée aux espaces" });
  }

  const { data: memberships } = await supabaseAdmin
    .from("class_students")
    .select("class_id, student_id, users(id, email, full_name)")
    .in("class_id", allClassIds);

  // Map class_id → liste d'étudiants
  const studentsByClass = new Map<string, { id: string; email: string; name: string }[]>();
  for (const m of memberships ?? []) {
    const user = Array.isArray(m.users) ? m.users[0] : m.users;
    if (!user?.email) continue;
    const existing = studentsByClass.get(m.class_id) ?? [];
    studentsByClass.set(m.class_id, [...existing, { id: user.id, email: user.email, name: user.full_name ?? "Étudiant" }]);
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  let totalSent = 0;

  for (const space of spaces as any[]) {
    const classIds = classIdsBySpace.get(space.id) ?? [];
    if (classIds.length === 0) continue;

    const alreadySubmitted = submittedBySpace.get(space.id) ?? new Set();
    const deadlineDate = new Date(space.deadline);
    const hoursLeft = Math.round((deadlineDate.getTime() - now.getTime()) / 1000 / 60 / 60);

    const deadlineFormatted = deadlineDate.toLocaleString("fr-FR", {
      dateStyle: "long",
      timeStyle: "short"
    });

    const teacherUser = Array.isArray(space.users) ? space.users[0] : space.users;
    const teacherName = teacherUser?.full_name ?? "Professeur";
    const universityRow = Array.isArray(space.universities) ? space.universities[0] : space.universities;
    const universityName = universityRow?.name ?? "Université";

    // Dédupliquer les étudiants qui n'ont pas encore déposé
    const seen = new Set<string>();
    const toNotify: { email: string; name: string }[] = [];
    for (const classId of classIds) {
      for (const student of studentsByClass.get(classId) ?? []) {
        if (!seen.has(student.id) && !alreadySubmitted.has(student.id)) {
          seen.add(student.id);
          toNotify.push({ email: student.email, name: student.name });
        }
      }
    }

    if (toNotify.length === 0) continue;

    const spaceUrl = `${getSiteUrl()}/spaces/${space.id}/submit`;
    const typeLabel: Record<string, string> = {
      devoir: "Devoir", tp: "TP", examen: "Examen", projet: "Projet", rapport: "Rapport"
    };

    const urgencyColor = hoursLeft <= 6 ? "#dc2626" : "#d97706";
    const urgencyText = hoursLeft <= 6
      ? `⚠️ Moins de ${hoursLeft}h restantes !`
      : `⏰ Plus que ${hoursLeft}h pour déposer`;

    const BATCH = 50;
    for (let i = 0; i < toNotify.length; i += BATCH) {
      const batch = toNotify.slice(i, i + BATCH);
      await Promise.allSettled(
        batch.map(({ email, name }) =>
          resend.emails.send({
            from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
            to: email,
            subject: `⏰ Rappel : "${space.title}" — deadline dans ${hoursLeft}h`,
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
                        <h2 style="margin:0 0 4px;font-size:18px;color:#0f172a">Tu n'as pas encore déposé</h2>
                        <p style="margin:0 0 20px;font-size:14px;font-weight:700;color:${urgencyColor}">${urgencyText}</p>

                        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin:0 0 20px">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:.05em">
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

                        <a href="${spaceUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:13px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
                          Déposer maintenant →
                        </a>

                        <p style="margin:20px 0 0;font-size:12px;color:#94a3b8">
                          Tu reçois cet email car tu n'as pas encore déposé pour cet espace sur SamaDepot (${universityName}).
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
      totalSent += batch.length;
    }

    console.log(`Deadline reminder "${space.title}": ${toNotify.length} emails envoyés`);
  }

  return NextResponse.json({
    sent: totalSent,
    spaces: spaces.length,
    message: `${totalSent} rappels envoyés pour ${spaces.length} espace(s)`
  });
}
