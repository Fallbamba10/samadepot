import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell active="Dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Mon profil</h1>
        <p className="mt-1 text-sm text-muted">Modifie tes informations personnelles et ton mot de passe.</p>
      </div>
      <ProfileClient user={user} />
    </AppShell>
  );
}
