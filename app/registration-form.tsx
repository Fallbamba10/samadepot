"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function RegistrationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      universityName: (form.elements.namedItem("universityName") as HTMLInputElement).value,
      emailDomain:    (form.elements.namedItem("emailDomain")    as HTMLInputElement).value,
      contactName:    (form.elements.namedItem("contactName")    as HTMLInputElement).value,
      contactEmail:   (form.elements.namedItem("contactEmail")   as HTMLInputElement).value,
      phone:          (form.elements.namedItem("phone")          as HTMLInputElement).value,
      studentsCount:  (form.elements.namedItem("studentsCount")  as HTMLSelectElement).value,
    };

    try {
      const res = await fetch("/api/school-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok || res.redirected) {
        setStatus("success");
      } else {
        const json = await res.json().catch(() => ({}));
        setErrorMsg(json.error ?? "Une erreur est survenue. Réessaie.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Erreur réseau. Vérifie ta connexion et réessaie.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
          <CheckCircle2 className="h-8 w-8 text-brand-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Demande envoyée !</h3>
        <p className="text-sm leading-relaxed text-slate-500">
          Nous avons bien reçu ta demande pour ton université. Tu seras contacté
          sous <strong className="text-slate-700">24h</strong> pour finaliser l'inscription.
        </p>
        <p className="text-xs text-slate-400">
          Un email de confirmation t'a été envoyé.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Nom de l'université *</label>
          <input
            name="universityName"
            required
            placeholder="UCAD, ESP, ISM…"
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Domaine email *</label>
          <input
            name="emailDomain"
            required
            placeholder="ucad.edu.sn"
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Votre nom *</label>
          <input
            name="contactName"
            required
            placeholder="Prénom Nom"
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email de contact *</label>
          <input
            name="contactEmail"
            type="email"
            required
            placeholder="vous@universite.sn"
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Téléphone WhatsApp</label>
        <input
          name="phone"
          placeholder="+221 77 000 00 00"
          className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Nombre d'étudiants estimé</label>
        <select
          name="studentsCount"
          className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">Sélectionner…</option>
          <option value="lt500">Moins de 500</option>
          <option value="500-2000">500 – 2 000</option>
          <option value="2000-5000">2 000 – 5 000</option>
          <option value="gt5000">Plus de 5 000</option>
        </select>
      </div>

      {status === "error" && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-500 disabled:opacity-70"
      >
        {status === "loading" ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>
            Soumettre la demande
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="text-center text-xs text-slate-400">Tu seras contacté sous 24h pour finaliser l'inscription.</p>
    </form>
  );
}
