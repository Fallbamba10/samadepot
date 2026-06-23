import Link from "next/link";
import { XCircle, ArrowLeft, ArrowRight } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-xl shadow-slate-900/5">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <XCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Paiement annulé</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Votre paiement n&apos;a pas été complété. Votre plan actuel reste inchangé.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
            >
              Voir les plans
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
