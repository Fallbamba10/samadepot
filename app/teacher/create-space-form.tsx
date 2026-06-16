"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, CheckCircle2, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AcademicOptions } from "@/types";

const formats = ["pdf", "docx", "pptx", "zip", "jpg", "png", "mp4"];

export function CreateSpaceForm({ options }: { options: AcademicOptions }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const selectedFormats = formData.getAll("formatsAllowed").map(String);
    const classIds = formData.getAll("classIds").map(String).filter(Boolean);
    const deadlineValue = String(formData.get("deadline") ?? "");

    const payload = {
      title: String(formData.get("title") ?? ""),
      description: optionalString(formData.get("description")),
      type: String(formData.get("type") ?? "devoir"),
      targetLevel: optionalString(formData.get("targetLevel")),
      subjectId: optionalString(formData.get("subjectId")),
      classIds,
      deadline: new Date(deadlineValue).toISOString(),
      formatsAllowed: selectedFormats,
      maxSizeMb: Number(formData.get("maxSizeMb") ?? 50),
      allowLate: formData.get("allowLate") === "on",
      allowResubmit: formData.get("allowResubmit") === "on"
    };

    const response = await fetch("/api/spaces", {
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

    setSuccess("Espace de depot cree avec succes.");
    form.reset();
    router.refresh();
  }

  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-line">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-600">
          <FolderPlus className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink">Créer un espace de dépôt</h2>
          <p className="text-xs text-muted">
            Ouvre un devoir, TP, PFE ou rapport pour tes étudiants.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Titre" name="title" placeholder="Projet de fin d'études 2026" required />
          <label className="block">
            <span className="text-xs font-semibold text-ink">Type</span>
            <select
              name="type"
              defaultValue="devoir"
              className="focus-ring mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-sm"
            >
              <option value="devoir">Devoir</option>
              <option value="examen">Examen</option>
              <option value="tp">TP</option>
              <option value="rapport_stage">Rapport de stage</option>
              <option value="pfe">PFE</option>
              <option value="memoire">Mémoire</option>
              <option value="expose">Exposé</option>
              <option value="autre">Autre</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-ink">Consignes</span>
          <textarea
            name="description"
            className="focus-ring mt-1 min-h-24 w-full resize-none rounded-md border border-line p-3 text-sm"
            placeholder="Ajoute les consignes, structure attendue, pièces à joindre..."
          />
        </label>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Deadline" name="deadline" type="datetime-local" required />
          <Field label="Niveau cible" name="targetLevel" placeholder="L3, M2..." />
          <Field label="Taille max (Mo)" name="maxSizeMb" type="number" defaultValue="50" required />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-ink">Matière</span>
            <select
              name="subjectId"
              className="focus-ring mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-sm"
            >
              <option value="">Aucune matière</option>
              {options.subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </label>
          <div>
            <div className="text-xs font-semibold text-ink">Classes ciblées</div>
            <div className="mt-2 flex max-h-32 flex-wrap gap-2 overflow-auto rounded-md border border-line p-2">
              {options.classes.length > 0 ? (
                options.classes.map((academicClass) => (
                  <label
                    key={academicClass.id}
                    className="inline-flex h-8 items-center gap-2 rounded-md border border-line bg-white px-3 text-xs font-semibold text-muted"
                  >
                    <input type="checkbox" name="classIds" value={academicClass.id} />
                    {academicClass.name}
                  </label>
                ))
              ) : (
                <div className="text-xs text-muted">
                  Aucune classe configuree par l'admin.
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-ink">Formats acceptés</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formats.map((format) => (
              <label
                key={format}
                className="inline-flex h-8 items-center gap-2 rounded-md border border-line bg-white px-3 text-xs font-semibold uppercase text-muted"
              >
                <input
                  type="checkbox"
                  name="formatsAllowed"
                  value={format}
                  defaultChecked={["pdf", "docx", "zip"].includes(format)}
                />
                {format}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="allowResubmit" defaultChecked />
            Autoriser le redépôt
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="allowLate" />
            Accepter les retards
          </label>
        </div>

        {error ? (
          <div className="flex gap-2 rounded-md bg-coral-50 px-3 py-2 text-sm text-coral-500">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="flex gap-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-600">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {success}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button disabled={isLoading}>
            {isLoading ? "Création..." : "Créer l'espace"}
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
  required = false,
  defaultValue
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        className="focus-ring mt-1 h-10 w-full rounded-md border border-line px-3 text-sm placeholder:text-muted"
      />
    </label>
  );
}

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}
