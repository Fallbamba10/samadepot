"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileUp,
  Hash,
  Loader2,
  Share2,
  Upload,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SpaceInfo = {
  id: string;
  formats: string[];
  maxSizeMb: number;
};

type SubmitResult = {
  id: string;
  status: string;
  file_hash?: string;
};

export function SubmitForm({ spaceId, space }: { spaceId: string; space: SpaceInfo }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [comment, setComment] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  function validateAndSetFile(f: File) {
    setError(null);
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    const allowedExts = space.formats.map((fmt) => fmt.toLowerCase());
    if (allowedExts.length > 0 && !allowedExts.includes(ext)) {
      setError(
        `Format .${ext} non autorisé. Formats acceptés : ${space.formats.join(", ")}`
      );
      return;
    }
    const sizeMb = f.size / 1024 / 1024;
    if (sizeMb > space.maxSizeMb) {
      setError(
        `Fichier trop volumineux (${sizeMb.toFixed(1)} Mo). Limite : ${space.maxSizeMb} Mo`
      );
      return;
    }
    setFile(f);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (selected) validateAndSetFile(selected);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Sélectionne un fichier avant de déposer.");
      return;
    }
    setError(null);
    setIsUploading(true);
    setProgress(5);

    const formData = new FormData();
    formData.append("spaceId", spaceId);
    formData.append("file", file);
    if (comment.trim()) formData.append("studentComment", comment.trim());

    // XHR pour vraie barre de progression
    const json = await new Promise<{ data?: SubmitResult; error?: string }>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/submissions");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 85));
        }
      };
      xhr.onload = () => {
        setProgress(100);
        try { resolve(JSON.parse(xhr.responseText)); }
        catch { resolve({ error: "Réponse invalide" }); }
      };
      xhr.onerror = () => resolve({ error: "Erreur réseau" });
      xhr.send(formData);
    });

    setIsUploading(false);

    if (json.error || !json.data) {
      setError(json.error ?? "Dépôt impossible");
      setProgress(0);
      return;
    }

    setResult(json.data);
    setTimeout(() => router.push(`/submissions/${json.data!.id}`), 2000);
  }

  if (result) {
    const verifyUrl = typeof window !== "undefined"
      ? `${window.location.origin}/verify?id=${result.id}`
      : `/verify?id=${result.id}`;
    const waText = `✅ J'ai bien déposé mon travail sur SamaDepot.\nRécépissé : ${result.id}\nVérifier : ${verifyUrl}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;

    return (
      <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft">
        {/* Bandeau succès */}
        <div className="bg-brand-600 px-6 py-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <CheckCircle2 className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-3 text-lg font-bold text-white">Dépôt confirmé !</h2>
          <p className="mt-1 text-sm text-white/70">
            Ton fichier est sécurisé et horodaté.
          </p>
        </div>

        <div className="p-5">
          {/* ID récépissé */}
          <div className="rounded-xl bg-brand-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Numéro récépissé</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="text-xl font-bold tracking-wider text-brand-600">{result.id}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(result.id)}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink"
              >
                <Copy className="h-3.5 w-3.5" />
                Copier
              </button>
            </div>
            {result.file_hash ? (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <Hash className="h-3.5 w-3.5 shrink-0 text-brand-600" />
                <span className="break-all font-mono">{result.file_hash.slice(0, 40)}…</span>
              </div>
            ) : null}
          </div>

          {/* Actions */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              <Share2 className="h-4 w-4" />
              Partager WhatsApp
            </a>
            <a
              href={`/submissions/${result.id}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-slate-50"
            >
              <ExternalLink className="h-4 w-4" />
              Voir le récépissé
            </a>
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            Redirigé automatiquement vers ton récépissé dans quelques secondes…
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-line bg-white p-4 shadow-line"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-600">
          <FileUp className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink">Déposer mon fichier</h2>
          <p className="text-xs text-muted">
            Horodaté, hashé SHA-256 et stocké dans un bucket privé.
          </p>
        </div>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`relative mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 transition ${
          isDragging
            ? "border-brand-500 bg-brand-50"
            : file
            ? "border-brand-500 bg-brand-50"
            : "border-line bg-slate-50 hover:border-brand-500 hover:bg-brand-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={space.formats.map((f) => `.${f.toLowerCase()}`).join(",")}
          onChange={handleFileChange}
          className="sr-only"
        />
        {file ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <FileUp className="h-6 w-6" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-ink">{file.name}</div>
              <div className="mt-1 text-xs text-muted">
                {(file.size / 1024 / 1024).toFixed(2)} Mo
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setError(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute right-3 top-3 rounded-md p-1 text-muted hover:bg-slate-200 hover:text-ink"
              aria-label="Retirer le fichier"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Upload className="h-6 w-6" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-ink">
                Glisse ton fichier ici ou clique pour sélectionner
              </div>
              <div className="mt-1 text-xs text-muted">
                Formats acceptés : {space.formats.join(", ")} · Max {space.maxSizeMb} Mo
              </div>
            </div>
          </>
        )}
      </div>

      {isUploading ? (
        <div className="mt-4 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-brand-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      <label className="mt-4 block">
        <span className="text-xs font-semibold text-ink">Commentaire (optionnel)</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="focus-ring mt-2 min-h-20 w-full resize-none rounded-md border border-line p-3 text-sm placeholder:text-muted"
          placeholder="Ex: Version finale avec annexes incluses."
        />
      </label>

      {error ? (
        <div className="mt-4 flex gap-2 rounded-md bg-coral-50 px-3 py-2 text-sm text-coral-500">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <Button disabled={isUploading || !file}>
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi en cours…
            </>
          ) : (
            "Confirmer le dépôt"
          )}
        </Button>
      </div>
    </form>
  );
}
