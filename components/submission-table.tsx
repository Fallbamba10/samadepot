import Link from "next/link";
import { Download, ReceiptText } from "lucide-react";
import type { Submission } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";

export function SubmissionTable({
  submissions
}: {
  submissions: Submission[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-line">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-bold text-ink">Depots recents</h2>
      </div>
      {submissions.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <h3 className="text-sm font-bold text-ink">Aucun depot pour le moment</h3>
          <p className="mt-2 text-sm text-muted">
            Les fichiers transmis apparaitront ici avec leur recepisse et leur statut.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Recepisse</th>
                <th className="px-4 py-3">Etudiant</th>
                <th className="px-4 py-3">Fichier</th>
                <th className="px-4 py-3">Espace</th>
                <th className="px-4 py-3">Depot</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} className="border-t border-line">
                  <td className="px-4 py-3 font-semibold text-ink">
                    {submission.id}
                  </td>
                  <td className="px-4 py-3 text-ink">{submission.student}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">
                      {submission.fileName}
                    </div>
                    <div className="text-xs text-muted">
                      {submission.sizeMb} Mo · {submission.hash.slice(0, 16)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{submission.spaceTitle}</td>
                  <td className="px-4 py-3 text-muted">{submission.submittedAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={submission.status} />
                      {submission.grade ? (
                        <span className="text-xs font-semibold text-ink">
                          {submission.grade}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/submissions/${submission.id}`}
                        aria-label="Voir le recepisse"
                        className="focus-ring flex h-9 w-9 items-center justify-center rounded-md border border-line text-muted hover:text-ink"
                      >
                        <ReceiptText className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/api/submissions/${submission.id}/download`}
                        aria-label="Telecharger le fichier"
                        className="focus-ring flex h-9 w-9 items-center justify-center rounded-md border border-line text-muted hover:text-ink"
                      >
                        <Download className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
