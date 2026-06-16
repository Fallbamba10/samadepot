import { AppShell } from "@/components/app-shell";
import { SpacesClient } from "./spaces-client";
import { getSpaces } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export default async function SpacesPage() {
  const [spaces, user] = await Promise.all([getSpaces(), getCurrentUser()]);
  const open = spaces.filter((s) => s.status !== "expired").length;
  const role = user?.role ?? "student";

  return (
    <AppShell active="Espaces">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Espaces de dépôt</h1>
        <p className="mt-1 text-sm text-muted">
          {open > 0
            ? `${open} espace${open > 1 ? "s" : ""} ouvert${open > 1 ? "s" : ""} · dépose ton travail avant la deadline`
            : "Aucun espace ouvert pour le moment"}
        </p>
      </div>
      <SpacesClient spaces={spaces} role={role} />
    </AppShell>
  );
}
