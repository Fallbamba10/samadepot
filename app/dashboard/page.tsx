import Link from "next/link";
import { ArrowRight, BookOpenCheck, CheckCircle2, Clock, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SpaceCard } from "@/components/space-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCurrentUser } from "@/lib/auth";
import { getSpaces, getSubmissions } from "@/lib/data";

export default async function DashboardPage() {
  const [currentUser, spaces, submissions] = await Promise.all([
    getCurrentUser(),
    getSpaces(),
    getSubmissions()
  ]);

  const firstName = currentUser?.fullName?.split(" ")[0] ?? "Étudiant";
  const openSpaces = spaces.filter((s) => s.status !== "expired");
  const mySubmissions = submissions.slice(0, 5);

  return (
    <AppShell active="Dashboard">
      {/* Salutation */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">
          Bonjour, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-muted">
          {openSpaces.length > 0
            ? `Tu as ${openSpaces.length} espace${openSpaces.length > 1 ? "s" : ""} de dépôt ouvert${openSpaces.length > 1 ? "s" : ""}.`
            : "Aucun espace ouvert pour le moment."}
        </p>
      </div>

      {/* Espaces ouverts */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-brand-600" />
            <h2 className="text-base font-bold text-ink">Espaces de dépôt</h2>
          </div>
          {spaces.length > 3 ? (
            <Link
              href="/spaces"
              className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
            >
              Voir tous <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>

        {openSpaces.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Clock className="h-6 w-6 text-muted" />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">Aucun espace ouvert</p>
            <p className="mt-1 text-sm text-muted">
              Les espaces créés par tes professeurs apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {openSpaces.slice(0, 3).map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        )}
      </section>

      {/* Mes dépôts récents */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-brand-600" />
            <h2 className="text-base font-bold text-ink">Mes dépôts récents</h2>
          </div>
          {submissions.length > 5 ? (
            <Link
              href="/submissions"
              className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
            >
              Voir tous <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>

        {mySubmissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Upload className="h-6 w-6 text-muted" />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">Aucun dépôt pour l'instant</p>
            <p className="mt-1 text-sm text-muted">
              Tes fichiers déposés et leur statut apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            {mySubmissions.map((sub, i) => (
              <Link
                key={sub.id}
                href={`/submissions/${sub.id}`}
                className={`flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-slate-50 ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">
                    {sub.spaceTitle}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted">
                    {sub.fileName} · {sub.submittedAt}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {sub.grade ? (
                    <span className="text-sm font-bold text-brand-600">{sub.grade}</span>
                  ) : null}
                  <StatusBadge status={sub.status} />
                  {sub.status === "returned" ? (
                    <span className="rounded-full bg-saffron-50 px-2.5 py-1 text-xs font-semibold text-saffron-500">
                      À corriger
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Tip si tout est bon */}
      {submissions.length > 0 && submissions.every((s) => s.status === "validated" || s.status === "graded") ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm font-semibold text-brand-600">
            Tous tes dépôts sont validés — bon travail !
          </p>
        </div>
      ) : null}
    </AppShell>
  );
}
