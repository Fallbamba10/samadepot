"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, CheckCircle2, RotateCcw, Search, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminUser, UserRole } from "@/types";

const roleLabels: Record<UserRole, string> = {
  student: "Etudiant",
  teacher: "Professeur",
  admin: "Admin",
  superadmin: "Superadmin"
};

export function UserManagement({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = users.filter((user) => {
    const value = `${user.fullName} ${user.email} ${user.role} ${user.departmentCode ?? ""} ${user.level ?? ""}`;
    return value.toLowerCase().includes(query.toLowerCase());
  });

  async function updateUser(
    user: AdminUser,
    payload: Partial<{
      role: Exclude<UserRole, "superadmin">;
      isActive: boolean;
    }>
  ) {
    setLoadingId(user.id);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await response.json();
    setLoadingId(null);

    if (!response.ok) {
      setError(json.error ?? "Modification impossible");
      return;
    }

    setMessage("Compte mis a jour.");
    router.refresh();
  }

  return (
    <section className="rounded-lg border border-line bg-white shadow-line">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-bold text-ink">Utilisateurs</h2>
          <p className="mt-1 text-xs text-muted">
            Liste des comptes, roles et statuts de l'universite.
          </p>
        </div>
        <label className="relative block md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="focus-ring h-10 w-full rounded-md border border-line pl-9 pr-3 text-sm"
            placeholder="Rechercher un compte"
          />
        </label>
      </div>

      {error ? (
        <div className="mx-4 mt-4 flex gap-2 rounded-md bg-coral-50 px-3 py-2 text-sm text-coral-500">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mx-4 mt-4 flex gap-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-600">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </div>
      ) : null}

      {filteredUsers.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <h3 className="text-sm font-bold text-ink">Aucun compte trouve</h3>
          <p className="mt-2 text-sm text-muted">
            Cree un premier compte ou ajuste ta recherche.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Compte</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Departement</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Creation</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{user.fullName}</div>
                    <div className="text-xs text-muted">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {user.role === "superadmin" ? (
                      <span className="text-sm font-semibold text-ink">
                        {roleLabels[user.role]}
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        disabled={loadingId === user.id}
                        onChange={(event) =>
                          updateUser(user, {
                            role: event.target.value as Exclude<UserRole, "superadmin">
                          })
                        }
                        className="focus-ring h-9 rounded-md border border-line bg-white px-2 text-sm"
                      >
                        <option value="student">Etudiant</option>
                        <option value="teacher">Professeur</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {user.departmentCode ?? "Aucun"} · {user.level ?? "Niveau libre"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        user.isActive
                          ? "rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600"
                          : "rounded-full bg-coral-50 px-2.5 py-1 text-xs font-semibold text-coral-500"
                      }
                    >
                      {user.isActive ? "Actif" : "Desactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{user.createdAt}</td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={loadingId === user.id}
                      onClick={() => updateUser(user, { isActive: !user.isActive })}
                      className="h-9"
                    >
                      {user.isActive ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                      {user.isActive ? "Desactiver" : "Reactiver"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
