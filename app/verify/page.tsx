import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { VerifyForm } from "./verify-form";

export const metadata = {
  title: "Vérifier un dépôt — SamaDepot",
  description: "Vérifiez l'authenticité d'un récépissé de dépôt universitaire SamaDepot sans avoir de compte."
};

export default async function VerifyPage({
  searchParams
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header minimaliste */}
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/login" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
              SD
            </div>
            <span className="text-sm font-bold text-ink">SamaDepot</span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-muted hover:text-ink"
          >
            Se connecter →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-soft">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ink">
            Vérifier un dépôt universitaire
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Entrez l'identifiant du récépissé (ex : <span className="font-mono font-semibold">SD-2026-00421</span>) pour confirmer qu'un travail a bien été déposé sur SamaDepot.
          </p>
        </div>

        <VerifyForm prefillId={id} />

        {/* Explication */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <InfoCard
            title="Sans compte"
            description="Aucune inscription nécessaire. La vérification est publique et gratuite."
          />
          <InfoCard
            title="Empreinte SHA-256"
            description="Chaque fichier est haché à la réception. Toute modification serait détectée."
          />
          <InfoCard
            title="Horodatage certifié"
            description="La date et l'heure du dépôt sont enregistrées de manière immuable."
          />
        </div>
      </main>
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="text-sm font-bold text-ink">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
    </div>
  );
}
