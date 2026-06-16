"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  User
} from "lucide-react";

type InviteInfo = {
  className: string;
  classCode: string;
  classLevel: string;
  universityName: string;
  expiresAt: string | null;
};

export function JoinClient({ token }: { token: string }) {
  const router = useRouter();
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/invitations/${token}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setFetchError(json.error);
        else setInfo(json.data);
      })
      .catch(() => setFetchError("Impossible de charger l'invitation"));
  }, [token]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await fetch(`/api/invitations/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName, password, studentNumber, phone })
    });
    const json = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setError(json.error ?? "Inscription impossible");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 3000);
  }

  if (fetchError) {
    return (
      <div className="rounded-2xl border border-coral-100 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coral-50">
          <AlertCircle className="h-7 w-7 text-coral-500" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-ink">Invitation invalide</h2>
        <p className="mt-2 text-sm text-muted">{fetchError}</p>
        <p className="mt-4 text-xs text-muted">
          Demande un nouveau lien à ton professeur.
        </p>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-soft">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
        <p className="mt-4 text-sm text-muted">Chargement…</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-brand-100 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-600">
          <CheckCircle2 className="h-7 w-7 text-white" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-ink">Bienvenue sur SamaDepot !</h2>
        <p className="mt-2 text-sm text-muted">
          Ton compte est créé et tu es inscrit en{" "}
          <span className="font-semibold text-ink">{info.className}</span>.
        </p>
        <p className="mt-4 text-xs text-muted">Redirection vers la connexion…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Logo */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-soft">
          SD
        </div>
        <h1 className="text-2xl font-bold text-ink">Rejoindre SamaDepot</h1>
        <p className="mt-1 text-sm text-muted">
          Crée ton compte pour déposer tes travaux
        </p>
      </div>

      {/* Carte classe */}
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
          <BookOpenCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-brand-600">
            {info.universityName}
          </div>
          <div className="mt-0.5 text-sm font-bold text-ink">
            {info.className}
          </div>
          <div className="text-xs text-muted">
            {info.classLevel} · {info.classCode}
          </div>
        </div>
        {info.expiresAt && (
          <div className="ml-auto text-right">
            <div className="text-[10px] text-muted">Expire le</div>
            <div className="text-xs font-semibold text-ink">
              {new Date(info.expiresAt).toLocaleDateString("fr-FR")}
            </div>
          </div>
        )}
      </div>

      {/* Formulaire */}
      <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <div className="grid gap-4">
          <FormField
            icon={<User className="h-4 w-4" />}
            label="Nom complet"
            value={fullName}
            onChange={setFullName}
            placeholder="Aminata Fall"
            required
          />
          <FormField
            icon={<Mail className="h-4 w-4" />}
            label="Email universitaire"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="prenom.nom@ucad.edu.sn"
            required
          />
          <FormField
            icon={<Lock className="h-4 w-4" />}
            label="Mot de passe (8 caractères min)"
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="••••••••"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              icon={<GraduationCap className="h-4 w-4" />}
              label="Numéro étudiant"
              value={studentNumber}
              onChange={setStudentNumber}
              placeholder="20240001 (optionnel)"
            />
            <FormField
              icon={<Phone className="h-4 w-4" />}
              label="Téléphone"
              value={phone}
              onChange={setPhone}
              placeholder="+221... (optionnel)"
            />
          </div>
        </div>

        {error ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-coral-50 px-3 py-2.5 text-sm text-coral-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              Créer mon compte
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="mt-4 text-center text-xs text-muted">
          Déjà inscrit ?{" "}
          <a href="/login" className="font-semibold text-brand-600 hover:underline">
            Se connecter
          </a>
        </p>
      </form>
    </div>
  );
}

function FormField({
  icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="h-11 w-full rounded-xl border border-line pl-10 pr-3 text-sm transition placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>
    </label>
  );
}
