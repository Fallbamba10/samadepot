import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="rounded-3xl border border-brand-100 bg-white p-10 shadow-xl shadow-brand-600/5">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Paiement confirmé !</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Votre abonnement est activé. Votre plan a été mis à jour.
          </p>
          {ref && (
            <p className="mt-2 font-mono text-xs text-slate-400">Réf : {ref}</p>
          )}
          <div className="mt-8 space-y-3">
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
            >
              Aller au tableau de bord
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="block text-sm text-slate-400 hover:text-slate-600"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
