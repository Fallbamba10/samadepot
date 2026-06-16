"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Lock, Mail, Phone, Save, User } from "lucide-react";
import type { AppUser } from "@/lib/auth";

const ROLE_LABELS: Record<string, string> = {
  student: "Étudiant",
  teacher: "Professeur",
  admin: "Administrateur",
  superadmin: "Super Admin"
};

export function ProfileClient({ user }: { user: AppUser }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedInfo, setSavedInfo] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [savedPwd, setSavedPwd] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  async function saveInfo(e: React.FormEvent) {
    e.preventDefault();
    setInfoError(null);
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone: phone || undefined })
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setInfoError(json.error ?? "Erreur"); return; }
    setSavedInfo(true);
    setTimeout(() => setSavedInfo(false), 3000);
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdError(null);
    if (newPassword !== confirmPassword) { setPwdError("Les mots de passe ne correspondent pas"); return; }
    if (newPassword.length < 8) { setPwdError("Minimum 8 caractères"); return; }
    setSavingPwd(true);
    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const json = await res.json();
    setSavingPwd(false);
    if (!res.ok) { setPwdError(json.error ?? "Erreur"); return; }
    setSavedPwd(true);
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setTimeout(() => setSavedPwd(false), 3000);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* Infos générales */}
      <section className="rounded-2xl border border-line bg-white p-6 shadow-line">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-600">
            {user.fullName.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-ink">{user.fullName}</p>
            <p className="text-sm text-muted">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </div>
        </div>

        <form onSubmit={saveInfo} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">Nom complet</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-line pl-10 pr-3 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={user.email}
                disabled
                className="h-11 w-full cursor-not-allowed rounded-xl border border-line bg-slate-50 pl-10 pr-3 text-sm text-muted"
              />
            </div>
            <p className="mt-1 text-[11px] text-muted">L'email ne peut pas être modifié.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">Téléphone (optionnel)</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+221 77 000 00 00"
                className="h-11 w-full rounded-xl border border-line pl-10 pr-3 text-sm transition placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {infoError && (
            <div className="flex items-center gap-2 text-sm text-coral-500">
              <AlertCircle className="h-4 w-4 shrink-0" /> {infoError}
            </div>
          )}
          {savedInfo && (
            <div className="flex items-center gap-2 text-sm text-brand-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> Informations mises à jour.
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      </section>

      {/* Changer mot de passe */}
      <section className="rounded-2xl border border-line bg-white p-6 shadow-line">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-50 text-saffron-500">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">Changer le mot de passe</h2>
            <p className="text-xs text-muted">Minimum 8 caractères.</p>
          </div>
        </div>

        <form onSubmit={savePassword} className="space-y-4">
          {[
            { label: "Mot de passe actuel", value: currentPassword, setter: setCurrentPassword },
            { label: "Nouveau mot de passe", value: newPassword, setter: setNewPassword },
            { label: "Confirmer le nouveau", value: confirmPassword, setter: setConfirmPassword }
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="mb-1.5 block text-xs font-semibold text-ink">{label}</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  value={value}
                  onChange={e => setter(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 w-full rounded-xl border border-line pl-10 pr-3 text-sm transition placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          ))}

          {pwdError && (
            <div className="flex items-center gap-2 text-sm text-coral-500">
              <AlertCircle className="h-4 w-4 shrink-0" /> {pwdError}
            </div>
          )}
          {savedPwd && (
            <div className="flex items-center gap-2 text-sm text-brand-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> Mot de passe mis à jour.
            </div>
          )}

          <button
            type="submit"
            disabled={savingPwd}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-saffron-500 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {savingPwd ? "Mise à jour…" : "Changer le mot de passe"}
          </button>
        </form>
      </section>
    </div>
  );
}
