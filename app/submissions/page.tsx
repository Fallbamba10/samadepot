import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getSubmissions } from "@/lib/data";
import { SubmissionsClient } from "./submissions-client";

export default async function SubmissionsPage() {
  const submissions = await getSubmissions();

  return (
    <AppShell active="Depots">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Mes dépôts</h1>
          <p className="mt-1 text-sm text-muted">
            {submissions.length > 0
              ? `${submissions.length} dépôt${submissions.length > 1 ? "s" : ""} · suivi en temps réel`
              : "Aucun dépôt pour le moment"}
          </p>
        </div>
        <Link
          href="/spaces"
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
        >
          Nouveau dépôt
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <SubmissionsClient submissions={submissions} />
    </AppShell>
  );
}
