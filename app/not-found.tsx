import Link from "next/link";
import { ArrowLeft, FileSearch } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
          <FileSearch className="h-8 w-8 text-brand-400" />
        </div>
        <p className="mb-2 font-mono text-5xl font-extrabold text-brand-200">404</p>
        <h1 className="mb-3 text-xl font-extrabold text-ink">Page introuvable</h1>
        <p className="mb-8 text-sm leading-relaxed text-muted">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
