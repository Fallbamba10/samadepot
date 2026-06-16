"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Copy, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type CreatedUser = {
  id: string;
  email: string;
  role: string;
  temporaryPassword?: string;
};

export function CreateUserForm({ universityId }: { universityId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCreatedUser(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      fullName: String(formData.get("fullName") ?? ""),
      role: String(formData.get("role") ?? "student"),
      universityId,
      phone: optionalString(formData.get("phone")),
      studentNumber: optionalString(formData.get("studentNumber")),
      departmentCode: optionalString(formData.get("departmentCode")),
      level: optionalString(formData.get("level")),
      temporaryPassword: optionalString(formData.get("temporaryPassword"))
    };

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError(result.error ?? "Creation impossible");
      return;
    }

    setCreatedUser(result.data);
    event.currentTarget.reset();
  }

  async function copyPassword() {
    if (createdUser?.temporaryPassword) {
      await navigator.clipboard.writeText(createdUser.temporaryPassword);
    }
  }

  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-line">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-600">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink">Créer un compte</h2>
          <p className="text-xs text-muted">
            Ajoute un étudiant, professeur ou admin UCAD.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Nom complet" name="fullName" required />
          <Field label="Email" name="email" type="email" required />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="text-xs font-semibold text-ink">Rôle</span>
            <select
              name="role"
              className="focus-ring mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-sm"
              defaultValue="student"
            >
              <option value="student">Étudiant</option>
              <option value="teacher">Professeur</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <Field label="Département" name="departmentCode" placeholder="INFO" />
          <Field label="Niveau" name="level" placeholder="L3, M1..." />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Téléphone" name="phone" placeholder="+221..." />
          <Field label="Numéro étudiant" name="studentNumber" />
          <Field
            label="Mot de passe temporaire"
            name="temporaryPassword"
            type="password"
            placeholder="Auto si vide"
          />
        </div>

        {error ? (
          <div className="flex gap-2 rounded-md bg-coral-50 px-3 py-2 text-sm text-coral-500">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        {createdUser ? (
          <div className="rounded-md border border-brand-100 bg-brand-50 p-3 text-sm text-brand-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div className="font-semibold">
                  Compte créé pour {createdUser.email}
                </div>
                {createdUser.temporaryPassword ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <code className="rounded bg-white px-2 py-1 text-xs text-ink">
                      {createdUser.temporaryPassword}
                    </code>
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="inline-flex items-center gap-1 text-xs font-semibold"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copier
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button disabled={isLoading}>
            {isLoading ? "Création..." : "Créer le compte"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = false
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="focus-ring mt-1 h-10 w-full rounded-md border border-line px-3 text-sm placeholder:text-muted"
      />
    </label>
  );
}

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}
