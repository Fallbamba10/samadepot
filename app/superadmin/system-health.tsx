"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  Mail,
  Server,
  XCircle
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type HealthCheck = {
  label: string;
  ok: boolean;
  detail: string;
  fix?: string;
};

export function SystemHealth({ checks }: { checks: HealthCheck[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showResendGuide, setShowResendGuide] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const allOk = checks.every((c) => c.ok);
  const failCount = checks.filter((c) => !c.ok).length;

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-muted" />
          <h2 className="text-base font-bold text-ink">Santé du système</h2>
          {allOk ? (
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600">Tout OK</span>
          ) : (
            <span className="rounded-full bg-coral-50 px-2.5 py-1 text-xs font-bold text-coral-500">
              {failCount} problème{failCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-white text-muted hover:text-ink"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-3">
          {/* Checks */}
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            {checks.map((check, i) => (
              <div
                key={check.label}
                className={cn(
                  "flex items-start gap-3 px-4 py-3",
                  i > 0 && "border-t border-line"
                )}
              >
                {check.ok
                  ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-coral-500" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{check.label}</p>
                  <p className="text-xs text-muted">{check.detail}</p>
                  {!check.ok && check.fix && (
                    <p className="mt-1 text-xs font-semibold text-coral-500">{check.fix}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bouton guide Resend si EMAIL_FROM ou RESEND absent */}
          {checks.some((c) => !c.ok && c.label.toLowerCase().includes("email")) && (
            <div>
              <button
                onClick={() => setShowResendGuide((v) => !v)}
                className="flex w-full items-center justify-between rounded-2xl border border-saffron-200 bg-saffron-50 px-5 py-4 text-left transition hover:bg-saffron-100"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-saffron-500" />
                  <div>
                    <p className="text-sm font-bold text-saffron-700">Configurer Resend pour envoyer des vrais emails</p>
                    <p className="text-xs text-saffron-500">Sans domaine vérifié, les emails n'arrivent qu'à ton adresse. Clique pour voir le guide.</p>
                  </div>
                </div>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-saffron-500 transition-transform", showResendGuide && "rotate-180")} />
              </button>

              {showResendGuide && (
                <div className="mt-2 overflow-hidden rounded-2xl border border-line bg-white">
                  <div className="border-b border-line bg-slate-50 px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">Guide — Vérification domaine Resend</p>
                  </div>
                  <div className="space-y-5 px-5 py-5">

                    <Step n={1} title="Ouvrir Resend Domains">
                      <p className="text-sm text-muted mb-3">
                        Va sur <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 underline">resend.com/domains</a> et clique sur <strong>"Add Domain"</strong>.
                      </p>
                      <a
                        href="https://resend.com/domains"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-100"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ouvrir Resend Domains
                      </a>
                    </Step>

                    <Step n={2} title="Entrer ton domaine">
                      <p className="text-sm text-muted mb-2">
                        Entre <strong>samadepot.app</strong> (ou le domaine que tu possèdes). Resend va te donner des enregistrements DNS à ajouter.
                      </p>
                      <CodeBlock value="samadepot.app" onCopy={() => copy("samadepot.app", "domain")} copied={copied === "domain"} />
                    </Step>

                    <Step n={3} title="Ajouter les enregistrements DNS">
                      <p className="text-sm text-muted">
                        Resend te donnera 2-3 enregistrements TXT/CNAME. Ajoute-les dans ton registrar (Namecheap, GoDaddy, Cloudflare…). La vérification prend <strong>5 à 30 minutes</strong>.
                      </p>
                    </Step>

                    <Step n={4} title="Mettre à jour les variables d'environnement Vercel">
                      <p className="text-sm text-muted mb-3">
                        Une fois le domaine vérifié, mets à jour ces deux variables dans <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 underline">Vercel → Settings → Environment Variables</a> :
                      </p>
                      <div className="space-y-2">
                        <div>
                          <p className="mb-1 text-xs font-bold text-ink">RESEND_API_KEY</p>
                          <p className="text-xs text-muted">Clé API Resend depuis <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">resend.com/api-keys</a></p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-bold text-ink">EMAIL_FROM</p>
                          <CodeBlock value="noreply@samadepot.app" onCopy={() => copy("noreply@samadepot.app", "email")} copied={copied === "email"} />
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-bold text-ink">CRON_SECRET</p>
                          <p className="text-xs text-muted">Une chaîne aléatoire longue pour sécuriser les cron jobs. Ex :</p>
                          <CodeBlock value="openssl rand -hex 32" onCopy={() => copy("openssl rand -hex 32", "cron")} copied={copied === "cron"} />
                        </div>
                      </div>
                    </Step>

                    <Step n={5} title="Redéployer sur Vercel">
                      <p className="text-sm text-muted">
                        Après avoir ajouté les variables, fais un redeploy depuis Vercel Dashboard pour qu'elles soient prises en compte.
                      </p>
                      <div className="mt-2 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-xs text-brand-600">
                        <p className="font-bold mb-1">✅ Une fois configuré</p>
                        <ul className="list-disc list-inside space-y-1 text-brand-500">
                          <li>Emails de bienvenue → vrais admins d'école</li>
                          <li>Notifications ouverture espace → vrais étudiants</li>
                          <li>Rappels deadline → étudiants qui n'ont pas déposé</li>
                        </ul>
                      </div>
                    </Step>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
        {n}
      </div>
      <div className="flex-1">
        <p className="mb-2 text-sm font-bold text-ink">{title}</p>
        {children}
      </div>
    </div>
  );
}

function CodeBlock({ value, onCopy, copied }: { value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-slate-50 px-3 py-2">
      <code className="flex-1 font-mono text-sm text-ink">{value}</code>
      <button
        onClick={onCopy}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-muted hover:text-ink"
      >
        {copied
          ? <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
          : <Copy className="h-3.5 w-3.5" />
        }
      </button>
    </div>
  );
}
