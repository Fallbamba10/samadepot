import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { getSubmissionById } from "@/lib/data";
import { ReviewForm } from "./review-form";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || !["teacher", "admin", "superadmin"].includes(user.role)) {
    redirect("/dashboard");
  }

  const submission = await getSubmissionById(id);
  if (!submission) notFound();

  return (
    <AppShell active="Espaces">
      <Link
        href={`/submissions/${id}`}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au dépôt
      </Link>

      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink">Évaluer le dépôt</h1>
          <p className="mt-1 text-sm text-muted">
            {submission.student} · {submission.fileName}
          </p>
        </div>

        <ReviewForm submissionId={id} currentGrade={submission.grade} currentComment={submission.reviewComment} />
      </div>
    </AppShell>
  );
}
