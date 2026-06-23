import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-canvas">
      <section className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <LoginForm />
          <div className="mt-5 text-center">
            <Link
              href="/verify"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand-600"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Vérifier un récépissé de dépôt sans compte
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
