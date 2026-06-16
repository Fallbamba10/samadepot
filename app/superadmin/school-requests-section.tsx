"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Globe,
  Mail,
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

function RejectModal({
  request,
  onClose,
  onConfirm
}: {
  request: SchoolRequest;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    onConfirm(reason);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm font-bold text-ink">Rejeter la demande</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-muted mb-3">
            Demande de <strong className="text-ink">{request.universityName}</strong> ({request.contactEmail})
          </p>
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            Raison du rejet <span className="font-normal text-muted">(optionnel)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Ex: Informations incomplètes, établissement non éligible…"
            className="w-full rounded-xl border border-line px-3 py-2.5 text-sm placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="flex gap-3 border-t border-line px-5 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-muted hover:text-ink"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
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

function RequestCard({ request, onActionDone }: { request: SchoolRequest; onActionDone: (id: string, newStatus: "approved" | "rejected") => void }) {
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailWarning, setEmailWarning] = useState<{ error: string; password: string } | null>(null);
  const isPending = request.status === "pending";

  async function handleAction(action: "approve" | "reject", reason = "") {
    setBusy(action);
    setError(null);
    setEmailWarning(null);
    try {
      const res = await fetch(`/api/superadmin/school-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erreur inconnue");
      } else {
        // Université créée, mais email a peut-être échoué
        if (json.data?.emailError) {
          setEmailWarning({ error: json.data.emailError, password: json.data.tempPassword ?? "" });
        }
        onActionDone(request.id, action === "approve" ? "approved" : "rejected");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setBusy(null);
      setShowRejectModal(false);
    }
  }

  const statusMeta = {
    pending:  { label: "En attente",  color: "bg-saffron-50 text-saffron-500" },
    approved: { label: "Approuvée",   color: "bg-brand-50 text-brand-600" },
    rejected: { label: "Rejetée",     color: "bg-coral-50 text-coral-500" }
  };
  const meta = statusMeta[request.status];

  return (
    <>
      <div className={cn(
        "rounded-2xl border bg-white p-5 transition",
        isPending ? "border-line hover:shadow-soft" : "border-line opacity-70"
      )}>
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-600">
              {request.universityName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink leading-snug">{request.universityName}</h3>
              <p className="text-xs text-muted">{request.emailDomain}</p>
            </div>
          </div>
          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold", meta.color)}>
            {meta.label}
          </span>
        </div>

        {/* Infos contact */}
        <div className="space-y-1.5 mb-4">
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
          <div className="mb-3 rounded-lg bg-coral-50 px-3 py-2 text-xs text-coral-500">
            {error}
          </div>
        )}

        {emailWarning && (
          <div className="mb-3 rounded-lg bg-saffron-50 border border-saffron-200 px-3 py-3 text-xs text-saffron-600 space-y-1.5">
            <p className="font-bold">⚠️ Université créée mais email non envoyé</p>
            <p>Erreur Resend : {emailWarning.error}</p>
            {emailWarning.password && (
              <p>Mot de passe temporaire : <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-saffron-200 select-all">{emailWarning.password}</span></p>
            )}
            <p className="text-saffron-500">Transmets ces identifiants manuellement à l'école.</p>
          </div>
        )}

        {/* Actions */}
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
              onClick={() => handleAction("approve")}
              disabled={busy !== null}
              className="flex flex-[2] items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
            >
              {busy === "approve" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {busy === "approve" ? "Traitement…" : "Approuver l'école"}
            </button>
          </div>
        )}
      </div>

      {showRejectModal && (
        <RejectModal
          request={request}
          onClose={() => setShowRejectModal(false)}
          onConfirm={(reason) => handleAction("reject", reason)}
        />
      )}
    </>
  );
}

export function SchoolRequestsSection({ initialRequests }: { initialRequests: SchoolRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [collapsed, setCollapsed] = useState(false);

  const pending = requests.filter((r) => r.status === "pending");
  const displayed = filter === "pending" ? pending : requests;

  function handleActionDone(id: string, newStatus: "approved" | "rejected") {
    setRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: newStatus } : r)
    );
  }

  return (
    <section className="mb-8">
      {/* En-tête section */}
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
          {/* Filtre */}
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
          {/* Collapse */}
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
              {requests.length === 0
                ? "Aucune demande reçue pour l'instant"
                : "Aucune demande en attente"}
            </p>
            {requests.length === 0 && (
              <p className="text-xs text-muted max-w-xs">
                Quand une école remplit le formulaire d'inscription sur la page d'accueil, la demande apparaîtra ici.
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayed.map((r) => (
              <RequestCard key={r.id} request={r} onActionDone={handleActionDone} />
            ))}
          </div>
        )
      )}
    </section>
  );
}
