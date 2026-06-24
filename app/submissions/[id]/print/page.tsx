import { notFound } from "next/navigation";
import { getSubmissionById } from "@/lib/data";
import { getSiteUrl } from "@/lib/env";

export default async function SubmissionPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await getSubmissionById(id);
  if (!s) notFound();

  const now = new Date().toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const STATUS_LABEL: Record<string, string> = {
    received: "Reçu",
    read: "Lu",
    validated: "Validé",
    graded: "Noté",
    returned: "À corriger",
    rejected: "Refusé",
    late: "En retard",
  };

  const TYPE_LABEL: Record<string, string> = {
    devoir: "Devoir",
    tp: "Travaux Pratiques",
    examen: "Examen",
    projet: "Projet",
    rapport: "Rapport",
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #0f172a; }
        @media print {
          .no-print { display: none !important; }
          body { padding: 0; }
        }
        @media screen {
          body { padding: 24px; background: #f1f5f9; }
          .page { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.12); overflow: hidden; }
        }
      `}</style>

      {/* Barre d'actions — visible seulement à l'écran */}
      <div className="no-print" style={{ maxWidth: 720, margin: "0 auto 16px", display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <a
          href={`/submissions/${id}`}
          style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#64748b", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          ← Retour
        </a>
        <button
          onClick={() => window.print()}
          style={{ padding: "8px 16px", borderRadius: 8, background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}
          suppressHydrationWarning
        >
          Imprimer / Enregistrer PDF
        </button>
      </div>

      <div className="page">
        {/* En-tête */}
        <div style={{ background: "#2563eb", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>SamaDepot</div>
            <div style={{ fontSize: 11, color: "#bfdbfe", marginTop: 2 }}>Récépissé numérique de dépôt</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#bfdbfe" }}>Généré le</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{now}</div>
          </div>
        </div>

        <div style={{ padding: "28px 32px" }}>
          {/* Titre */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#eff6ff", borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 12 }}>
              RÉCÉPISSÉ #{s.id.slice(0, 8).toUpperCase()}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>{s.spaceTitle}</h1>
            {s.spaceType && (
              <div style={{ marginTop: 4, fontSize: 13, color: "#64748b" }}>
                {TYPE_LABEL[s.spaceType] ?? s.spaceType}
              </div>
            )}
          </div>

          {/* Grille d'infos */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 24 }}>
            <tbody>
              {[
                ["Étudiant", s.student],
                ["Email", s.studentEmail ?? "—"],
                ["N° étudiant", s.studentNumber ?? "—"],
                ["Date de dépôt", s.submittedAt],
                s.deadline ? ["Deadline", s.deadline] : null,
                ["Statut", STATUS_LABEL[s.status] ?? s.status],
                s.grade ? ["Note", s.grade] : null,
                s.version ? ["Version", `Version ${s.version}`] : null,
              ].filter(Boolean).map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 0", width: 140, color: "#64748b", fontWeight: 600, verticalAlign: "top" }}>
                    {row![0]}
                  </td>
                  <td style={{ padding: "8px 0", color: "#0f172a", fontWeight: 500, verticalAlign: "top" }}>
                    {row![1]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Fichier */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Fichier transmis
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{s.fileName}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.sizeMb} Mo</div>
          </div>

          {/* Commentaire étudiant */}
          {s.comment && (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Commentaire
              </div>
              <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{s.comment}</div>
            </div>
          )}

          {/* Évaluation */}
          {(s.reviewComment || s.grade) && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 18px", marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Évaluation
              </div>
              {s.grade && <div style={{ fontSize: 20, fontWeight: 800, color: "#2563eb" }}>{s.grade}</div>}
              {s.reviewComment && <div style={{ fontSize: 13, color: "#334155", marginTop: 4, lineHeight: 1.6 }}>{s.reviewComment}</div>}
              {s.reviewedAt && <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>Évalué le {s.reviewedAt}</div>}
            </div>
          )}

          {/* Empreinte SHA-256 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Empreinte SHA-256
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 11, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", wordBreak: "break-all", color: "#475569", lineHeight: 1.7 }}>
              {s.hash}
            </div>
          </div>

          {/* Avertissement légal */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16, fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
            Ce document est un récépissé électronique généré automatiquement par la plateforme SamaDepot.
            L&apos;empreinte SHA-256 ci-dessus permet de vérifier l&apos;intégrité du fichier déposé.
            Pour vérification publique : {getSiteUrl()}/verify?id={s.id}
          </div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelectorAll('button').forEach(btn => {
              btn.addEventListener('click', () => window.print());
            });
          `,
        }}
      />
    </>
  );
}
