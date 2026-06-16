import { Resend } from "resend";
import { getSiteUrl } from "@/lib/env";

export function hasEmailConfig() {
  return Boolean(process.env.RESEND_API_KEY);
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

const FROM = process.env.EMAIL_FROM ?? "SamaDepot <noreply@samadepot.sn>";

// ── Email : dépôt reçu (pour le prof) ─────────────────────────────────────
export async function sendSubmissionReceivedEmail(opts: {
  teacherEmail: string;
  teacherName: string;
  studentName: string;
  spaceTitle: string;
  spaceType: string;
  submissionId: string;
  fileName: string;
  submittedAt: string;
  isLate: boolean;
}) {
  if (!hasEmailConfig()) return;
  const resend = getResend();
  const link = `${getSiteUrl()}/submissions/${opts.submissionId}`;

  await resend.emails.send({
    from: FROM,
    to: opts.teacherEmail,
    subject: `📥 Nouveau dépôt — ${opts.studentName} · ${opts.spaceTitle}`,
    html: emailTemplate({
      title: "Nouveau dépôt reçu",
      preheader: `${opts.studentName} vient de déposer pour « ${opts.spaceTitle} »`,
      body: `
        <p>Bonjour ${opts.teacherName},</p>
        <p><strong>${opts.studentName}</strong> vient de déposer son travail.</p>
        ${opts.isLate ? '<p style="color:#ef4444;font-weight:600">⚠️ Ce dépôt est en retard.</p>' : ""}
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Espace</td><td style="padding:6px 0;font-weight:600">${opts.spaceTitle}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Type</td><td style="padding:6px 0">${opts.spaceType}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Fichier</td><td style="padding:6px 0">${opts.fileName}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Déposé le</td><td style="padding:6px 0">${opts.submittedAt}</td></tr>
        </table>
      `,
      ctaLabel: "Évaluer le dépôt",
      ctaUrl: link
    })
  });
}

// ── Email : travail évalué (pour l'étudiant) ──────────────────────────────
export async function sendReviewNotificationEmail(opts: {
  studentEmail: string;
  studentName: string;
  teacherName: string;
  spaceTitle: string;
  decision: "validate" | "grade" | "return" | "reject";
  grade?: number;
  comment?: string;
  submissionId: string;
}) {
  if (!hasEmailConfig()) return;
  const resend = getResend();
  const link = `${getSiteUrl()}/submissions/${opts.submissionId}`;

  const decisionMeta = {
    validate: { emoji: "✅", label: "Validé",       color: "#16a34a" },
    grade:    { emoji: "🎓", label: "Noté",          color: "#2563eb" },
    return:   { emoji: "🔄", label: "À corriger",    color: "#d97706" },
    reject:   { emoji: "❌", label: "Refusé",        color: "#dc2626" }
  }[opts.decision];

  await resend.emails.send({
    from: FROM,
    to: opts.studentEmail,
    subject: `${decisionMeta.emoji} Ton travail a été évalué — ${opts.spaceTitle}`,
    html: emailTemplate({
      title: `Travail ${decisionMeta.label.toLowerCase()}`,
      preheader: `${opts.teacherName} a évalué ton dépôt pour « ${opts.spaceTitle} »`,
      body: `
        <p>Bonjour ${opts.studentName},</p>
        <p><strong>${opts.teacherName}</strong> a évalué ton travail pour <strong>${opts.spaceTitle}</strong>.</p>
        <div style="margin:20px 0;padding:16px 20px;border-left:4px solid ${decisionMeta.color};background:#f8fafc;border-radius:0 8px 8px 0;">
          <span style="font-size:13px;font-weight:600;color:${decisionMeta.color}">${decisionMeta.emoji} ${decisionMeta.label}</span>
          ${opts.grade !== undefined ? `<p style="margin:8px 0 0;font-size:24px;font-weight:700;color:#0f172a">${opts.grade}/20</p>` : ""}
          ${opts.comment ? `<p style="margin:8px 0 0;font-size:14px;color:#475569">${opts.comment}</p>` : ""}
        </div>
        ${opts.decision === "return" ? "<p>Consulte les commentaires de ton professeur et dépose une version corrigée.</p>" : ""}
      `,
      ctaLabel: "Voir mon récépissé",
      ctaUrl: link
    })
  });
}

// ── Email : bienvenue après inscription ───────────────────────────────────
export async function sendWelcomeEmail(opts: {
  email: string;
  fullName: string;
  universityName: string;
  temporaryPassword?: string;
}) {
  if (!hasEmailConfig()) return;
  const resend = getResend();

  await resend.emails.send({
    from: FROM,
    to: opts.email,
    subject: "🎓 Bienvenue sur SamaDepot",
    html: emailTemplate({
      title: "Bienvenue sur SamaDepot",
      preheader: `Ton compte est prêt — ${opts.universityName}`,
      body: `
        <p>Bonjour ${opts.fullName},</p>
        <p>Ton compte SamaDepot a été créé pour <strong>${opts.universityName}</strong>.</p>
        ${opts.temporaryPassword ? `
        <div style="margin:20px 0;padding:16px 20px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;">
          <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:600">MOT DE PASSE TEMPORAIRE</p>
          <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:2px;color:#0f172a;font-family:monospace">${opts.temporaryPassword}</p>
          <p style="margin:8px 0 0;font-size:12px;color:#94a3b8">Change-le dès ta première connexion.</p>
        </div>` : ""}
        <p>Utilise ton email et ce mot de passe pour te connecter.</p>
      `,
      ctaLabel: "Se connecter",
      ctaUrl: getSiteUrl() + "/login"
    })
  });
}

// ── Template HTML ─────────────────────────────────────────────────────────
function emailTemplate(opts: {
  title: string;
  preheader: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${opts.title}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden">${opts.preheader}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
        <!-- Header -->
        <tr>
          <td style="background:#2563eb;padding:24px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:rgba(255,255,255,.2);border-radius:10px;font-size:14px;font-weight:700;color:#fff">SD</div>
                </td>
                <td style="padding-left:12px">
                  <span style="font-size:16px;font-weight:700;color:#fff">SamaDepot</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;font-size:15px;line-height:1.6;color:#334155">
            <h1 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#0f172a">${opts.title}</h1>
            ${opts.body}
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 32px">
            <a href="${opts.ctaUrl}" style="display:inline-block;background:#2563eb;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none">${opts.ctaLabel} →</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8">
            SamaDepot · Plateforme de dépôt de travaux universitaires<br>
            <a href="${getSiteUrl()}" style="color:#94a3b8">${getSiteUrl()}</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
