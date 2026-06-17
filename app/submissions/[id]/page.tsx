import Link from "next/link";
import { ArrowLeft, Download, ExternalLink, FileCheck2, Hash, Printer, ReceiptText, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSubmissionById } from "@/lib/data";

export default async function SubmissionReceiptPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getSubmissionById(id);

  return (
    <AppShell active="Depots">
      <Link
        href="/submissions"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux depots
      </Link>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.72fr]">
        <section className="rounded-lg border border-line bg-white p-5 shadow-line">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                <ReceiptText className="h-4 w-4" />
                Recepisse numerique
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">
                Depot {submission.id}
              </h1>
              <p className="mt-2 text-sm text-muted">
                Preuve horodatee du fichier transmis sur SamaDepot.
              </p>
            </div>
            <StatusBadge status={submission.status} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Info label="Etudiant" value={submission.student} />
            <Info label="Email" value={submission.studentEmail ?? "Non renseigne"} />
            <Info label="Numero etudiant" value={submission.studentNumber ?? "Non renseigne"} />
            <Info label="Espace" value={submission.spaceTitle} />
            <Info label="Type" value={submission.spaceType ?? "Depot"} />
            <Info label="Date de depot" value={submission.submittedAt} />
            <Info label="Deadline" value={submission.deadline ?? "Non renseignee"} />
            <Info label="Version" value={`Version ${submission.version ?? 1}`} />
          </div>

          {submission.comment ? (
            <div className="mt-5 rounded-md border border-line bg-slate-50 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                Commentaire etudiant
              </div>
              <p className="mt-2 text-sm leading-6 text-ink">{submission.comment}</p>
            </div>
          ) : null}
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-line bg-white p-5 shadow-line">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-lagoon-50 text-lagoon-500">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-ink">Fichier transmis</h2>
                <p className="text-xs text-muted">{submission.sizeMb} Mo</p>
              </div>
            </div>
            <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm font-medium text-ink">
              {submission.fileName}
            </div>
            <div className="mt-4 grid gap-2">
              <Link
                href={`/api/submissions/${submission.id}/download`}
                className="focus-ring inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-500"
              >
                <Download className="h-4 w-4" />
                Telecharger
              </Link>
              <Link
                href={`/submissions/${submission.id}/print`}
                target="_blank"
                className="focus-ring inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-muted transition hover:text-ink"
              >
                <Printer className="h-4 w-4 text-brand-600" />
                Imprimer / Enregistrer PDF
              </Link>
              <Link
                href={`/verify?id=${submission.id}`}
                target="_blank"
                className="focus-ring inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-muted transition hover:text-ink"
              >
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                Lien de vérification publique
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-5 shadow-line">
            <div className="flex items-center gap-2 text-sm font-bold text-ink">
              <Hash className="h-4 w-4 text-brand-600" />
              Empreinte SHA-256
            </div>
            <p className="mt-3 break-all rounded-md bg-slate-50 p-3 font-mono text-xs leading-5 text-muted">
              {submission.hash}
            </p>
          </section>

          {submission.reviewComment || submission.grade ? (
            <section className="rounded-lg border border-line bg-white p-5 shadow-line">
              <h2 className="text-sm font-bold text-ink">Evaluation</h2>
              {submission.grade ? (
                <p className="mt-3 text-lg font-bold text-brand-600">
                  {submission.grade}
                </p>
              ) : null}
              {submission.reviewComment ? (
                <p className="mt-2 text-sm leading-6 text-muted">
                  {submission.reviewComment}
                </p>
              ) : null}
              {submission.reviewedAt ? (
                <p className="mt-3 text-xs text-muted">
                  Evalue le {submission.reviewedAt}
                </p>
              ) : null}
            </section>
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}
