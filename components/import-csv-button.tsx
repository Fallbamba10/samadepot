"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X
} from "lucide-react";

type ImportResult = {
  created: number;
  skipped: number;
  errors: number;
  rows: { email: string; status: "created" | "skipped" | "error"; message?: string }[];
};

const CSV_TEMPLATE = `nom_complet,email,role,numero_etudiant,departement,niveau,telephone
Aminata Fall,aminata.fall@ucad.edu.sn,student,20240001,INFO,L3,+221771234567
Moussa Diallo,moussa.diallo@ucad.edu.sn,student,20240002,INFO,L3,
Fatou Seck,fatou.seck@ucad.edu.sn,student,20240003,GESTION,L2,
Ibrahima Ndiaye,ibrahima.ndiaye@ucad.edu.sn,teacher,,,Algorithmique,+221779876543
`;

export function ImportCsvButton({ defaultRole = "student" }: { defaultRole?: "student" | "teacher" }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<{ email: string; fullName: string; role: string }[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [rawRows, setRawRows] = useState<object[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "samadepot_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(file: File) {
    setParseError(null);
    setPreview([]);
    setRawRows([]);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = String(e.target?.result ?? "");
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) throw new Error("Fichier vide ou sans données");

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const parsed = lines.slice(1).map((line) => {
          const cols = line.split(",").map((c) => c.trim());
          const row: Record<string, string> = {};
          headers.forEach((h, i) => { row[h] = cols[i] ?? ""; });
          return row;
        });

        const mapped = parsed.map((r) => ({
          fullName: r["nom_complet"] || r["full_name"] || r["nom"] || "",
          email: r["email"] || "",
          role: (r["role"] === "teacher" ? "teacher" : defaultRole) as "student" | "teacher",
          studentNumber: r["numero_etudiant"] || r["student_number"] || undefined,
          departmentCode: r["departement"] || r["department"] || undefined,
          level: r["niveau"] || r["level"] || undefined,
          phone: r["telephone"] || r["phone"] || undefined
        }));

        const invalid = mapped.filter((r) => !r.email || !r.fullName);
        if (invalid.length > 0) {
          setParseError(`${invalid.length} ligne(s) sans email ou nom complet — corrige le fichier.`);
        }

        setRawRows(mapped);
        setPreview(mapped.slice(0, 5));
      } catch (err) {
        setParseError(err instanceof Error ? err.message : "Fichier invalide");
      }
    };
    reader.readAsText(file);
  }

  async function runImport() {
    setIsLoading(true);
    setResult(null);

    const res = await fetch("/api/admin/users/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: rawRows, defaultRole })
    });
    const json = await res.json();
    setIsLoading(false);
    setResult(json.data);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-slate-50"
      >
        <FileSpreadsheet className="h-4 w-4 text-brand-600" />
        Importer CSV
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-ink">Import CSV — Création de comptes en masse</h3>
          <p className="mt-0.5 text-xs text-muted">
            Télécharge le modèle, remplis-le dans Excel, importe-le ici.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setOpen(false); setPreview([]); setResult(null); setRawRows([]); }}
          className="rounded-md p-1 text-muted hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Étape 1 — Télécharger le modèle */}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
        <div>
          <p className="text-xs font-bold text-ink">Étape 1 — Modèle CSV</p>
          <p className="text-[11px] text-muted">nom_complet, email, role, numero_etudiant, departement, niveau, telephone</p>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-muted transition hover:text-ink"
        >
          <Download className="h-3.5 w-3.5" />
          Télécharger
        </button>
      </div>

      {/* Étape 2 — Choisir le fichier */}
      <div className="mt-3">
        <p className="mb-2 text-xs font-bold text-ink">Étape 2 — Importer le fichier rempli</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          className="sr-only"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line py-6 text-sm font-semibold text-muted transition hover:border-brand-500 hover:text-brand-600"
        >
          <Upload className="h-5 w-5" />
          Choisir le fichier .csv
        </button>
      </div>

      {parseError ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-coral-50 px-3 py-2.5 text-sm text-coral-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {parseError}
        </div>
      ) : null}

      {/* Prévisualisation */}
      {preview.length > 0 && !result ? (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-ink">Aperçu ({rawRows.length} lignes)</p>
            {rawRows.length > 5 && (
              <span className="text-[11px] text-muted">… et {rawRows.length - 5} autres</span>
            )}
          </div>
          <div className="overflow-hidden rounded-xl border border-line">
            {preview.map((row, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 text-xs ${i > 0 ? "border-t border-line" : ""}`}>
                <div className={`flex h-6 w-14 items-center justify-center rounded-full text-[10px] font-bold ${row.role === "teacher" ? "bg-saffron-50 text-saffron-500" : "bg-brand-50 text-brand-600"}`}>
                  {row.role === "teacher" ? "Prof" : "Étudiant"}
                </div>
                <span className="font-semibold text-ink">{row.fullName}</span>
                <span className="text-muted">{row.email}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={runImport}
            disabled={isLoading || !!parseError}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Import en cours…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Créer {rawRows.length} compte{rawRows.length > 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      ) : null}

      {/* Résultat */}
      {result ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Chip label="Créés" value={result.created} color="brand" />
            <Chip label="Ignorés" value={result.skipped} color="slate" />
            <Chip label="Erreurs" value={result.errors} color="coral" />
          </div>

          {result.rows.filter((r) => r.status === "error").length > 0 && (
            <div className="rounded-xl bg-coral-50 p-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-coral-500">Erreurs</p>
              {result.rows
                .filter((r) => r.status === "error")
                .map((r, i) => (
                  <p key={i} className="text-xs text-coral-500">
                    {r.email} — {r.message}
                  </p>
                ))}
            </div>
          )}

          <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-sm text-brand-600">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-semibold">{result.created} compte{result.created > 1 ? "s" : ""} créé{result.created > 1 ? "s" : ""} avec succès</span>
          </div>

          <button
            type="button"
            onClick={() => { setResult(null); setPreview([]); setRawRows([]); }}
            className="w-full text-center text-xs text-muted hover:underline"
          >
            Faire un autre import
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Chip({ label, value, color }: { label: string; value: number; color: "brand" | "slate" | "coral" }) {
  const cls = {
    brand: "bg-brand-50 text-brand-600",
    slate: "bg-slate-100 text-muted",
    coral: "bg-coral-50 text-coral-500"
  };
  return (
    <div className={`rounded-xl p-3 text-center ${cls[color]}`}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[11px] font-semibold">{label}</div>
    </div>
  );
}
