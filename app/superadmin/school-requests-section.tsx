"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Mail,
  MessageCircle,
  Phone,
  Users,
  X,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

type SchoolRequest = {
  id: string;
  universityName: string;
  emailDomain: string;
  contactName: string;
  contactEmail: string;
  phone: string | null;
  studentsCount: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  rejectReason?: string | null;
};

type ApprovedCredentials = {
  email: string;
  password: string;
  universityName: string;
  emailSent: boolean;
};

// ── Bouton copier ────────────────────────────────────────────────────────────
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={copy}
      className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-muted transition hover:text-ink"
      title="Copier"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-brand-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ── Modal identifiants (montée au niveau section = survit aux démontages) ────
function CredentialsModal({ creds, onClose }: { creds: ApprovedCredentials; onClose: () => void }) {
  const loginUrl = "https://samadepot.vercel.app/login";
  const whatsappText = encodeURIComponent(
    `Bonjour ${creds.universityName} 👋\n\nVotre école est maintenant active sur SamaDepot !\n\n` +
    `🔗 Lien : ${loginUrl}\n` +
    `📧 Email : ${creds.email}\n` +
    `🔑 Mot de passe : ${creds.password}\n\n` +
    `Connectez-vous et changez votre mot de passe depuis votre profil.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-brand-600" />
            <h2 className="text-sm font-bold text-ink">École approuvée — Identifiants</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {creds.emailSent ? (
            <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-xs text-brand-600">
              <p className="font-bold">Email envoyé ✓</p>
              <p className="mt-0.5">L'admin a reçu ses identifiants par email. Tu peux aussi les partager via WhatsApp.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-saffron-200 bg-saffron-50 px-4 py-3 text-xs text-saffron-600">
              <p className="font-bold">Email non envoyé</p>
              <p className="mt-0.5">Transmets les identifiants manuellement via WhatsApp ou en les copiant.</p>
            </div>
          )}

          <div className="space-y-3 rounded-xl border border-line bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Identifiants de connexion</p>

            <div>
              <p className="mb-1 text-[11px] text-muted">Email</p>
              <div className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-2.5">
                <span className="text-sm font-semibold text-ink">{creds.email}</span>
                <CopyButton value={creds.email} />
              </div>
            </div>

            <div>
              <p className="mb-1 text-[11px] text-muted">Mot de passe temporaire</p>
              <div className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-2.5">
                <span className="font-mono text-base font-bold tracking-wider text-ink">{creds.password}</span>
                <CopyButton value={creds.password} />
              </div>
            </div>

            <div>
              <p className="mb-1 text-[11px] text-muted">Lien de connexion</p>
              <div className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-2.5">
                <span className="text-sm text-ink">samadepot.vercel.app/login</span>
                <CopyButton value={loginUrl} />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" />
              Envoyer sur WhatsApp
            </a>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-muted hover:text-ink"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal rejet ───────────────────────────────────────────────────────────────
function RejectModal({
  request, onClose, onConfirm
}: {
  request: SchoolRequest;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm font-bold text-ink">Rejeter la demande</h2>
          <button onClick={onClose} className="text-muted hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-4">
          <p className="mb-3 text-sm text-muted">
            Demande de <strong className="text-ink">{request.universityName}</strong>
          </p>
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            Raison <span className="font-normal text-muted">(optionnel)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Ex: Informations incomplètes…"
            className="w-full rounded-xl border border-line px-3 py-2.5 text-sm placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="flex gap-3 border-t border-line px-5 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-muted hover:text-ink">
            Annuler
          </button>
          <button
            onClick={() => { setBusy(true); onConfirm(reason); }}
            disabled={busy}
            className="flex-1 rounded-xl bg-coral-500 py-2.5 text-sm font-semibold text-white transition hover:bg-coral-600 disabled:opacity-60"
          >
            {busy ? "Rejet en cours…" : "Confirmer le rejet"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Carte demande ─────────────────────────────────────────────────────────────
function RequestCard({ request, onApproved, onRejected }: {
  request: SchoolRequest;
  onApproved: (id: string, creds: ApprovedCredentials) => void;
  onRejected: (id: string) => void;
}) {
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setBusy("approve");
    setError(null);
    try {
      const res = await fetch(`/api/superadmin/school-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erreur inconnue");
      } else {
        // Remonter les credentials au parent AVANT de changer le statut
        onApproved(request.id, {
          email: json.data?.adminEmail ?? request.contactEmail,
          password: json.data?.tempPassword ?? "(mot de passe non reçu)",
          universityName: request.universityName,
          emailSent: Boolean(json.data?.emailSent) && !json.data?.emailError
        });
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setBusy(null);
    }
  }

  async function handleReject(reason: string) {
    setBusy("reject");
    setError(null);
    try {
      const res = await fetch(`/api/superadmin/school-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erreur inconnue");
      } else {
        onRejected(request.id);
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setBusy(null);
      setShowRejectModal(false);
    }
  }

  const statusMeta = {
    pending:  { label: "En attente", color: "bg-saffron-50 text-saffron-500" },
    approved: { label: "Approuvée",  color: "bg-brand-50 text-brand-600" },
    rejected: { label: "Rejetée",    color: "bg-coral-50 text-coral-500" }
  };
  const meta = statusMeta[request.status];
  const isPending = request.status === "pending";

  return (
    <>
      <div className={cn(
        "rounded-2xl border bg-white p-5 transition",
        isPending ? "border-line hover:shadow-soft" : "border-line opacity-70"
      )}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-600">
              {request.universityName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold leading-snug text-ink">{request.universityName}</h3>
              <p className="text-xs text-muted">{request.emailDomain}</p>
            </div>
          </div>
          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold", meta.color)}>
            {meta.label}
          </span>
        </div>

        <div className="mb-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{request.contactName} — {request.contactEmail}</span>
          </div>
          {request.phone && (
            <div className="flex items-center gap-2 text-xs text-muted">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{request.phone}</span>
            </div>
          )}
          {request.studentsCount && (
            <div className="flex items-center gap-2 text-xs text-muted">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>{request.studentsCount} étudiants estimés</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{request.createdAt}</span>
          </div>
        </div>

        {request.rejectReason && (
          <div className="mb-3 rounded-lg bg-coral-50 px-3 py-2 text-xs text-coral-500">
            Raison : {request.rejectReason}
          </div>
        )}
        {error && (
          <div className="mb-3 rounded-lg bg-coral-50 px-3 py-2 text-xs text-coral-500">{error}</div>
        )}

        {isPending && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={busy !== null}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-coral-200 py-2.5 text-xs font-semibold text-coral-500 transition hover:bg-coral-50 disabled:opacity-60"
            >
              <XCircle className="h-3.5 w-3.5" />
              Rejeter
            </button>
            <button
              onClick={handleApprove}
              disabled={busy !== null}
              className="flex flex-[2] items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
            >
              {busy === "approve"
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                : <CheckCircle2 className="h-3.5 w-3.5" />}
              {busy === "approve" ? "Traitement…" : "Approuver l'école"}
            </button>
          </div>
        )}
        {request.status === "approved" && (
          <button
            onClick={handleApprove}
            disabled={busy !== null}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-200 py-2.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 disabled:opacity-60"
          >
            {busy === "approve"
              ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
              : <Copy className="h-3.5 w-3.5" />}
            {busy === "approve" ? "Chargement…" : "Voir les identifiants"}
          </button>
        )}
      </div>

      {showRejectModal && (
        <RejectModal
          request={request}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleReject}
        />
      )}
    </>
  );
}

// ── Section principale ────────────────────────────────────────────────────────
export function SchoolRequestsSection({ initialRequests }: { initialRequests: SchoolRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [collapsed, setCollapsed] = useState(false);
  // État des credentials HISSÉ ici — survit au démontage de RequestCard
  const [credentials, setCredentials] = useState<ApprovedCredentials | null>(null);

  const pending = requests.filter((r) => r.status === "pending");
  const displayed = filter === "pending" ? pending : requests;

  function handleApproved(id: string, creds: ApprovedCredentials) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r));
    setCredentials(creds); // ouvre la modal APRÈS avoir mis à jour la liste
  }

  function handleRejected(id: string) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r));
  }

  return (
    <>
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-saffron-500" />
            <h2 className="text-base font-bold text-ink">Demandes d'inscription</h2>
            {pending.length > 0 && (
              <span className="rounded-full bg-saffron-50 px-2.5 py-1 text-xs font-bold text-saffron-500">
                {pending.length} en attente
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-line bg-white p-1">
              {(["pending", "all"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-semibold transition",
                    filter === f ? "bg-brand-600 text-white" : "text-muted hover:text-ink"
                  )}
                >
                  {f === "pending" ? "En attente" : "Toutes"}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-white text-muted hover:text-ink"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            </button>
          </div>
        </div>

        {!collapsed && (
          displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-white py-10 text-center">
              <BadgeCheck className="h-8 w-8 text-brand-200" />
              <p className="text-sm font-semibold text-muted">
                {requests.length === 0 ? "Aucune demande reçue pour l'instant" : "Aucune demande en attente"}
              </p>
              {requests.length === 0 && (
                <p className="max-w-xs text-xs text-muted">
                  Quand une école remplit le formulaire d'inscription sur la page d'accueil, la demande apparaîtra ici.
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {displayed.map((r) => (
                <RequestCard
                  key={r.id}
                  request={r}
                  onApproved={handleApproved}
                  onRejected={handleRejected}
                />
              ))}
            </div>
          )
        )}
      </section>

      {/* Modal montée au niveau section — ne se démonte pas avec la carte */}
      {credentials && (
        <CredentialsModal
          creds={credentials}
          onClose={() => setCredentials(null)}
        />
      )}
    </>
  );
}
