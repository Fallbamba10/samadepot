"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcademicClass, AcademicOptions, Subject } from "@/types";

// ─── Types locaux ─────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

interface FormState {
  // Étape 1 — Contexte pédagogique
  type: string;
  subjectId: string;
  semester: string;
  // Étape 2 — Classes ciblées
  classIds: string[];
  // Étape 3 — Paramètres du dépôt
  title: string;
  description: string;
  deadline: string;
  formatsAllowed: string[];
  maxSizeMb: number;
  allowLate: boolean;
  allowResubmit: boolean;
}

const SPACE_TYPES = [
  { value: "devoir",        label: "Devoir",         icon: "📝" },
  { value: "tp",            label: "TP",              icon: "💻" },
  { value: "td",            label: "TD",              icon: "📐" },
  { value: "examen",        label: "Examen",          icon: "📋" },
  { value: "partiel",       label: "Partiel",         icon: "📊" },
  { value: "rapport_stage", label: "Rapport de stage",icon: "🏢" },
  { value: "pfe",           label: "PFE / Mémoire",   icon: "🎓" },
  { value: "expose",        label: "Exposé",          icon: "🗣️" },
  { value: "projet",        label: "Projet",          icon: "🔧" },
  { value: "autre",         label: "Autre",           icon: "📁" },
];

const FORMATS = ["pdf", "docx", "pptx", "zip", "py", "java", "mp4", "jpg"];
const SEMESTERS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "Rattrapage", "Tous semestres"];

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function groupClassesByDeptAndLevel(classes: AcademicClass[]) {
  const map: Record<string, Record<string, AcademicClass[]>> = {};
  for (const c of classes) {
    if (!map[c.department]) map[c.department] = {};
    const key = `${c.level} — ${c.filiere}`;
    if (!map[c.department][key]) map[c.department][key] = [];
    map[c.department][key].push(c);
  }
  return map;
}

function buildAutoTitle(state: FormState, subjects: Subject[]) {
  const type = SPACE_TYPES.find(t => t.value === state.type)?.label ?? state.type;
  const subject = subjects.find(s => s.id === state.subjectId);
  const sem = state.semester && state.semester !== "Tous semestres" ? ` · ${state.semester}` : "";
  const year = new Date().getFullYear();
  if (subject) return `${type} — ${subject.name}${sem} · ${year}`;
  return `${type}${sem} · ${year}`;
}

// ─── Composants internes ──────────────────────────────────────────────────────

function StepDot({ n, current }: { n: Step; current: Step }) {
  const done = n < current;
  const active = n === current;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
        done   && "border-brand-600 bg-brand-600 text-white",
        active && "border-brand-600 bg-white text-brand-600",
        !done && !active && "border-line bg-white text-muted"
      )}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : n}
      </div>
      <span className={cn("text-[10px] font-semibold", active ? "text-brand-600" : "text-muted")}>
        {n === 1 ? "Contexte" : n === 2 ? "Classes" : "Paramètres"}
      </span>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-xs font-bold text-ink">{children}</span>;
}

// ─── Étape 1 — Contexte pédagogique ──────────────────────────────────────────

function Step1({
  state, setState, subjects
}: {
  state: FormState;
  setState: React.Dispatch<React.SetStateAction<FormState>>;
  subjects: Subject[];
}) {
  const deptSubjects = useMemo(() => {
    const map: Record<string, Subject[]> = {};
    for (const s of subjects) {
      const dept = s.department ?? "Autres";
      if (!map[dept]) map[dept] = [];
      map[dept].push(s);
    }
    return map;
  }, [subjects]);

  return (
    <div className="space-y-5">
      {/* Type de travail */}
      <div>
        <FieldLabel>Type de travail *</FieldLabel>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {SPACE_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setState(s => ({ ...s, type: t.value }))}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition",
                state.type === t.value
                  ? "border-brand-600 bg-brand-50 text-brand-600"
                  : "border-line bg-white text-muted hover:border-brand-300 hover:text-ink"
              )}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matière */}
      <div>
        <FieldLabel>Matière concernée</FieldLabel>
        <select
          value={state.subjectId}
          onChange={e => setState(s => ({ ...s, subjectId: e.target.value }))}
          className="h-10 w-full rounded-xl border border-line px-3 text-sm focus:border-brand-600 focus:outline-none"
        >
          <option value="">— Aucune matière spécifique —</option>
          {Object.entries(deptSubjects).map(([dept, subs]) => (
            <optgroup key={dept} label={dept}>
              {subs.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}){s.credits ? ` · ${s.credits} crédits` : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Semestre */}
      <div>
        <FieldLabel>Semestre / Session</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {SEMESTERS.map(sem => (
            <button
              key={sem}
              type="button"
              onClick={() => setState(s => ({ ...s, semester: sem }))}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                state.semester === sem
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-line bg-white text-muted hover:text-ink"
              )}
            >
              {sem}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Étape 2 — Classes ciblées ────────────────────────────────────────────────

function Step2({
  state, setState, classes
}: {
  state: FormState;
  setState: React.Dispatch<React.SetStateAction<FormState>>;
  classes: AcademicClass[];
}) {
  const grouped = useMemo(() => groupClassesByDeptAndLevel(classes), [classes]);
  const totalExpected = useMemo(
    () => classes.filter(c => state.classIds.includes(c.id)).reduce((sum, c) => sum + (c.capacity ?? 0), 0),
    [classes, state.classIds]
  );

  // Filtrer par semestre sélectionné à l'étape 1
  const filtered = useMemo(() => {
    if (!state.semester || state.semester === "Tous semestres") return classes;
    return classes.filter(c => !c.semester || c.semester === state.semester);
  }, [classes, state.semester]);

  const filteredGrouped = useMemo(() => groupClassesByDeptAndLevel(filtered), [filtered]);

  function toggleClass(id: string) {
    setState(s => ({
      ...s,
      classIds: s.classIds.includes(id)
        ? s.classIds.filter(c => c !== id)
        : [...s.classIds, id]
    }));
  }

  function toggleGroup(ids: string[]) {
    const allSelected = ids.every(id => state.classIds.includes(id));
    if (allSelected) {
      setState(s => ({ ...s, classIds: s.classIds.filter(id => !ids.includes(id)) }));
    } else {
      setState(s => ({ ...s, classIds: [...new Set([...s.classIds, ...ids])] }));
    }
  }

  function toggleDept(dept: string) {
    const deptClasses = filtered.filter(c => c.department === dept).map(c => c.id);
    const allSelected = deptClasses.every(id => state.classIds.includes(id));
    if (allSelected) {
      setState(s => ({ ...s, classIds: s.classIds.filter(id => !deptClasses.includes(id)) }));
    } else {
      setState(s => ({ ...s, classIds: [...new Set([...s.classIds, ...deptClasses])] }));
    }
  }

  return (
    <div className="space-y-4">
      {/* Résumé sélection */}
      {state.classIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-600">
            <Users className="h-4 w-4" />
            {state.classIds.length} classe{state.classIds.length > 1 ? "s" : ""} sélectionnée{state.classIds.length > 1 ? "s" : ""}
          </div>
          {totalExpected > 0 && (
            <span className="text-sm font-bold text-brand-600">
              ~{totalExpected} étudiants attendus
            </span>
          )}
        </div>
      )}

      {Object.entries(filteredGrouped).map(([dept, levels]) => {
        const deptIds = filtered.filter(c => c.department === dept).map(c => c.id);
        const deptAllSelected = deptIds.length > 0 && deptIds.every(id => state.classIds.includes(id));
        return (
          <div key={dept} className="overflow-hidden rounded-2xl border border-line bg-white">
            {/* En-tête département */}
            <div className="flex items-center justify-between border-b border-line bg-slate-50 px-4 py-2.5">
              <span className="text-xs font-bold uppercase tracking-wide text-ink">{dept}</span>
              <button
                type="button"
                onClick={() => toggleDept(dept)}
                className={cn(
                  "rounded-lg border px-3 py-1 text-[10px] font-bold transition",
                  deptAllSelected
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line bg-white text-muted hover:text-ink"
                )}
              >
                {deptAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
            </div>

            {/* Groupes niveau/filière */}
            <div className="divide-y divide-line">
              {Object.entries(levels).map(([levelKey, levelClasses]) => {
                const levelIds = levelClasses.map(c => c.id);
                const levelAllSelected = levelIds.every(id => state.classIds.includes(id));
                return (
                  <div key={levelKey} className="px-4 py-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted">{levelKey}</span>
                      <button
                        type="button"
                        onClick={() => toggleGroup(levelIds)}
                        className="text-[10px] font-semibold text-brand-600 hover:underline"
                      >
                        {levelAllSelected ? "Désélectionner" : "Sélectionner tout"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {levelClasses.map(cls => {
                        const selected = state.classIds.includes(cls.id);
                        return (
                          <button
                            key={cls.id}
                            type="button"
                            onClick={() => toggleClass(cls.id)}
                            className={cn(
                              "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                              selected
                                ? "border-brand-600 bg-brand-600 text-white"
                                : "border-line bg-white text-muted hover:border-brand-300 hover:text-ink"
                            )}
                          >
                            <span>{cls.name}</span>
                            {cls.groupType && cls.groupType !== "CM" && (
                              <span className={cn(
                                "rounded px-1.5 py-0.5 text-[9px] font-bold",
                                selected ? "bg-brand-500 text-white" : "bg-slate-100 text-muted"
                              )}>
                                {cls.groupType}
                              </span>
                            )}
                            {cls.capacity && (
                              <span className={cn(
                                "rounded px-1.5 py-0.5 text-[9px]",
                                selected ? "bg-brand-500 text-white" : "text-muted"
                              )}>
                                {cls.capacity}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center">
          <p className="text-sm text-muted">
            Aucune classe disponible pour le semestre sélectionné.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Étape 3 — Paramètres du dépôt ───────────────────────────────────────────

function Step3({
  state, setState
}: {
  state: FormState;
  setState: React.Dispatch<React.SetStateAction<FormState>>;
}) {
  // Deadline minimum : maintenant
  const minDatetime = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  function toggleFormat(fmt: string) {
    setState(s => ({
      ...s,
      formatsAllowed: s.formatsAllowed.includes(fmt)
        ? s.formatsAllowed.filter(f => f !== fmt)
        : [...s.formatsAllowed, fmt]
    }));
  }

  return (
    <div className="space-y-5">
      {/* Titre */}
      <div>
        <FieldLabel>Titre de l'espace *</FieldLabel>
        <input
          value={state.title}
          onChange={e => setState(s => ({ ...s, title: e.target.value }))}
          placeholder="Ex : TP Algorithmique · L2 Info · S4"
          required
          className="h-10 w-full rounded-xl border border-line px-3 text-sm focus:border-brand-600 focus:outline-none"
        />
        <p className="mt-1 text-[11px] text-muted">Titre pré-rempli automatiquement — modifiable.</p>
      </div>

      {/* Consignes */}
      <div>
        <FieldLabel>Consignes pour les étudiants</FieldLabel>
        <textarea
          value={state.description}
          onChange={e => setState(s => ({ ...s, description: e.target.value }))}
          rows={3}
          placeholder="Décris la structure attendue, les ressources à joindre, le format de nommage des fichiers..."
          className="w-full resize-none rounded-xl border border-line p-3 text-sm focus:border-brand-600 focus:outline-none"
        />
      </div>

      {/* Deadline */}
      <div>
        <FieldLabel>Date et heure limite de dépôt *</FieldLabel>
        <div className="relative">
          <CalendarClock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="datetime-local"
            value={state.deadline}
            min={minDatetime}
            onChange={e => setState(s => ({ ...s, deadline: e.target.value }))}
            required
            className="h-10 w-full rounded-xl border border-line pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Formats acceptés */}
        <div>
          <FieldLabel>Formats de fichiers acceptés *</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {FORMATS.map(fmt => (
              <button
                key={fmt}
                type="button"
                onClick={() => toggleFormat(fmt)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-bold uppercase transition",
                  state.formatsAllowed.includes(fmt)
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line bg-white text-muted hover:text-ink"
                )}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Taille max */}
        <div>
          <FieldLabel>Taille maximale par fichier</FieldLabel>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={500}
              step={5}
              value={state.maxSizeMb}
              onChange={e => setState(s => ({ ...s, maxSizeMb: Number(e.target.value) }))}
              className="flex-1 accent-brand-600"
            />
            <span className="w-20 text-right text-sm font-bold text-ink">
              {state.maxSizeMb} Mo
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted">
            TP / Devoir : 20–80 Mo · Rapport / PFE : 50–200 Mo
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4 rounded-xl border border-line bg-slate-50 px-4 py-3">
        <label className="flex items-center gap-2.5 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={state.allowResubmit}
            onChange={e => setState(s => ({ ...s, allowResubmit: e.target.checked }))}
            className="h-4 w-4 accent-brand-600"
          />
          Autoriser le redépôt
          <span className="font-normal text-muted">(l'étudiant peut corriger et renvoyer)</span>
        </label>
        <label className="flex items-center gap-2.5 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={state.allowLate}
            onChange={e => setState(s => ({ ...s, allowLate: e.target.checked }))}
            className="h-4 w-4 accent-brand-600"
          />
          Accepter les retards
          <span className="font-normal text-muted">(dépôt après deadline, marqué "En retard")</span>
        </label>
      </div>
    </div>
  );
}

// ─── Wizard principal ─────────────────────────────────────────────────────────

export function CreateSpaceWizard({ options }: { options: AcademicOptions }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<FormState>({
    type: "tp",
    subjectId: "",
    semester: "S4",
    classIds: [],
    title: "",
    description: "",
    deadline: "",
    formatsAllowed: ["pdf", "zip"],
    maxSizeMb: 50,
    allowLate: false,
    allowResubmit: true,
  });

  // Auto-update title when context changes
  function handleSetState(updater: React.SetStateAction<FormState>) {
    setState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      // Regen title only if user hasn't manually edited it or it was auto-generated
      const wasAuto = !prev.title || prev.title === buildAutoTitle(prev, options.subjects);
      if (wasAuto && (next.type !== prev.type || next.subjectId !== prev.subjectId || next.semester !== prev.semester)) {
        next.title = buildAutoTitle(next, options.subjects);
      }
      return next;
    });
  }

  function canAdvance() {
    if (step === 1) return Boolean(state.type);
    if (step === 2) return state.classIds.length > 0;
    if (step === 3) return Boolean(state.title && state.deadline && state.formatsAllowed.length > 0);
    return false;
  }

  function advance() {
    if (step < 3) {
      // Auto-rempli le titre en passant à l'étape 3
      if (step === 2 && !state.title) {
        setState(s => ({ ...s, title: buildAutoTitle(s, options.subjects) }));
      }
      setStep((s) => (s + 1) as Step);
    }
  }

  function back() {
    if (step > 1) setStep((s) => (s - 1) as Step);
  }

  async function handleSubmit() {
    setIsLoading(true);
    setError(null);

    const payload = {
      title: state.title,
      description: state.description || undefined,
      type: state.type,
      subjectId: state.subjectId || undefined,
      semester: state.semester || undefined,
      classIds: state.classIds,
      deadline: new Date(state.deadline).toISOString(),
      formatsAllowed: state.formatsAllowed,
      maxSizeMb: state.maxSizeMb,
      allowLate: state.allowLate,
      allowResubmit: state.allowResubmit,
    };

    const res = await fetch("/api/spaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setError(result.error ?? "Création impossible. Réessaie.");
      return;
    }

    router.refresh();
    router.push(result.data?.id ? `/teacher/spaces/${result.data.id}` : "/teacher");
  }

  const totalExpected = useMemo(
    () => options.classes.filter(c => state.classIds.includes(c.id)).reduce((sum, c) => sum + (c.capacity ?? 0), 0),
    [options.classes, state.classIds]
  );

  return (
    <div className="rounded-2xl border border-line bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <FolderPlus className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink">Créer un espace de dépôt</h2>
          <p className="text-xs text-muted">Pour tes étudiants — en 3 étapes</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center justify-between">
          {([1, 2, 3] as Step[]).map((n, i) => (
            <div key={n} className="flex flex-1 items-center">
              <StepDot n={n} current={step} />
              {i < 2 && (
                <div className={cn(
                  "mx-2 h-0.5 flex-1 transition-all",
                  n < step ? "bg-brand-600" : "bg-line"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5">
        {step === 1 && (
          <Step1 state={state} setState={handleSetState} subjects={options.subjects} />
        )}
        {step === 2 && (
          <Step2 state={state} setState={handleSetState} classes={options.classes} />
        )}
        {step === 3 && (
          <Step3 state={state} setState={handleSetState} />
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-coral-50 px-4 py-3 text-sm text-coral-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Footer — Récap + navigation */}
      <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-4">
        {/* Récap rapide */}
        <div className="min-w-0 flex-1 text-xs text-muted">
          {step >= 1 && state.type && (
            <span className="mr-2 font-semibold text-ink">
              {SPACE_TYPES.find(t => t.value === state.type)?.icon}{" "}
              {SPACE_TYPES.find(t => t.value === state.type)?.label}
            </span>
          )}
          {step >= 2 && state.classIds.length > 0 && (
            <span className="mr-2">
              · {state.classIds.length} classe{state.classIds.length > 1 ? "s" : ""}
              {totalExpected > 0 && ` (${totalExpected} étudiants)`}
            </span>
          )}
          {step === 3 && state.deadline && (
            <span>· {new Date(state.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
          )}
        </div>

        {/* Boutons */}
        <div className="flex shrink-0 gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={back}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-line px-4 text-sm font-semibold text-muted transition hover:text-ink"
            >
              <ChevronLeft className="h-4 w-4" />
              Retour
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={advance}
              disabled={!canAdvance()}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-500 disabled:opacity-40"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !canAdvance()}
              className="flex h-9 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-500 disabled:opacity-40"
            >
              {isLoading ? (
                <>Création...</>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  Ouvrir l'espace
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
