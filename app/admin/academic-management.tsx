"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Hash,
  Layers,
  Plus,
  UsersRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcademicOptions } from "@/types";

const LEVELS = ["L1", "L2", "L3", "M1", "M2", "DUT1", "DUT2", "BTS1", "BTS2", "Doctorat", "PCEM1", "PCEM2"];
const GROUP_TYPES = ["CM", "TP", "TD"];
const SEMESTERS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "Rattrapage"];
const CURRENT_YEAR = "2025-2026";

type TabId = "classes" | "subjects" | "assign_student" | "assign_teacher";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "classes",         label: "Créer une classe",       icon: GraduationCap },
  { id: "subjects",        label: "Créer une matière",      icon: BookOpen },
  { id: "assign_student",  label: "Inscrire étudiant",      icon: UsersRound },
  { id: "assign_teacher",  label: "Affecter professeur",    icon: Layers },
];

export function AcademicManagement({ options }: { options: AcademicOptions }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("classes");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(action: string, payload: Record<string, unknown>) {
    setError(null);
    setMessage(null);
    setIsLoading(true);

    const res = await fetch("/api/admin/academic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload })
    });
    const json = await res.json();
    setIsLoading(false);

    if (!res.ok) { setError(json.error ?? "Action impossible"); return false; }
    setMessage(json.message ?? "Enregistré avec succès.");
    router.refresh();
    return true;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white">
      {/* En-tête */}
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">Structure académique</h2>
            <p className="text-xs text-muted">
              {options.classes.length} classes · {options.subjects.length} matières ·{" "}
              {options.students.length} étudiants · {options.teachers.length} professeurs
            </p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex overflow-x-auto border-b border-line">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setError(null); setMessage(null); }}
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 px-5 py-3 text-xs font-semibold transition whitespace-nowrap",
              tab === t.id
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-muted hover:text-ink"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Feedback */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-coral-50 px-4 py-3 text-sm text-coral-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-600">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {message}
          </div>
        )}

        {tab === "classes" && (
          <ClassForm onSubmit={submit} isLoading={isLoading} />
        )}
        {tab === "subjects" && (
          <SubjectForm onSubmit={submit} isLoading={isLoading} />
        )}
        {tab === "assign_student" && (
          <AssignStudentForm options={options} onSubmit={submit} isLoading={isLoading} />
        )}
        {tab === "assign_teacher" && (
          <AssignTeacherForm options={options} onSubmit={submit} isLoading={isLoading} />
        )}
      </div>
    </section>
  );
}

// ─── Formulaire : créer une classe ───────────────────────────────────────────

function ClassForm({
  onSubmit, isLoading
}: {
  onSubmit: (action: string, payload: Record<string, unknown>) => Promise<boolean>;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    name: "", code: "", department: "", filiere: "", level: "L1",
    semester: "S2", groupType: "CM", capacity: "30", academicYear: CURRENT_YEAR
  });

  function set(k: string, v: string) {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      // Auto-generate code and name when department+filiere+level+groupType change
      if (["department", "filiere", "level", "groupType"].includes(k)) {
        const dept = (next.department.split(" ")[0] ?? "").slice(0, 4).toUpperCase();
        const grp = next.groupType !== "CM" ? `-${next.groupType}` : "";
        next.code = `${next.level}-${dept}${grp}`.replace(/\s/g, "");
        const fil = next.filiere ? ` ${next.filiere}` : "";
        next.name = `${next.level}${fil}${grp ? ` (${next.groupType})` : ""}`;
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onSubmit("create_class", {
      name: form.name, code: form.code, department: form.department,
      filiere: form.filiere, level: form.level, semester: form.semester,
      groupType: form.groupType, capacity: Number(form.capacity),
      academicYear: form.academicYear
    });
    if (ok) setForm({ name: "", code: "", department: "", filiere: "", level: "L1", semester: "S2", groupType: "CM", capacity: "30", academicYear: CURRENT_YEAR });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Département *" hint="Informatique, Gestion, Droit…">
          <input value={form.department} onChange={e => set("department", e.target.value)} placeholder="Informatique" required className={inputCls} />
        </F>
        <F label="Filière *" hint="MIAGE, Génie Logiciel, Finance…">
          <input value={form.filiere} onChange={e => set("filiere", e.target.value)} placeholder="Informatique Générale" required className={inputCls} />
        </F>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <F label="Niveau *">
          <Sel value={form.level} onChange={v => set("level", v)} options={LEVELS} />
        </F>
        <F label="Semestre">
          <Sel value={form.semester} onChange={v => set("semester", v)} options={SEMESTERS} />
        </F>
        <F label="Groupe">
          <Sel value={form.groupType} onChange={v => set("groupType", v)} options={GROUP_TYPES} />
        </F>
        <F label="Capacité">
          <input type="number" min={1} max={300} value={form.capacity} onChange={e => set("capacity", e.target.value)} className={inputCls} />
        </F>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <F label="Nom complet *">
          <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="L2 Informatique A" required className={inputCls} />
        </F>
        <F label="Code *" hint="Généré auto, modifiable">
          <input value={form.code} onChange={e => set("code", e.target.value)} placeholder="L2-INFO-A" required className={cn(inputCls, "font-mono uppercase")} />
        </F>
        <F label="Année académique">
          <input value={form.academicYear} onChange={e => set("academicYear", e.target.value)} placeholder="2025-2026" className={inputCls} />
        </F>
      </div>
      <div className="flex justify-end">
        <SubmitBtn isLoading={isLoading} icon={Plus} label="Créer la classe" />
      </div>
    </form>
  );
}

// ─── Formulaire : créer une matière ──────────────────────────────────────────

function SubjectForm({
  onSubmit, isLoading
}: {
  onSubmit: (action: string, payload: Record<string, unknown>) => Promise<boolean>;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    name: "", code: "", department: "", coefficient: "2", credits: "4"
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onSubmit("create_subject", {
      name: form.name, code: form.code.toUpperCase(), department: form.department,
      coefficient: Number(form.coefficient), credits: Number(form.credits)
    });
    if (ok) setForm({ name: "", code: "", department: "", coefficient: "2", credits: "4" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Intitulé de la matière *">
          <input value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} placeholder="Algorithmique et Structures de Données" required className={inputCls} />
        </F>
        <F label="Département">
          <input value={form.department} onChange={e => setForm(s => ({ ...s, department: e.target.value }))} placeholder="Informatique" className={inputCls} />
        </F>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <F label="Code matière *" hint="Ex: INFO201">
          <input value={form.code} onChange={e => setForm(s => ({ ...s, code: e.target.value }))} placeholder="INFO201" required className={cn(inputCls, "font-mono uppercase")} />
        </F>
        <F label="Coefficient" hint="Poids dans la moyenne">
          <input type="number" min={1} max={10} value={form.coefficient} onChange={e => setForm(s => ({ ...s, coefficient: e.target.value }))} className={inputCls} />
        </F>
        <F label="Crédits ECTS">
          <input type="number" min={1} max={30} value={form.credits} onChange={e => setForm(s => ({ ...s, credits: e.target.value }))} className={inputCls} />
        </F>
      </div>
      <div className="flex justify-end">
        <SubmitBtn isLoading={isLoading} icon={BookOpen} label="Créer la matière" />
      </div>
    </form>
  );
}

// ─── Formulaire : inscrire un étudiant ───────────────────────────────────────

function AssignStudentForm({
  options, onSubmit, isLoading
}: {
  options: AcademicOptions;
  onSubmit: (action: string, payload: Record<string, unknown>) => Promise<boolean>;
  isLoading: boolean;
}) {
  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const depts = [...new Set(options.classes.map(c => c.department))].filter(Boolean).sort();
  const filteredClasses = deptFilter
    ? options.classes.filter(c => c.department === deptFilter)
    : options.classes;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onSubmit("assign_student", { studentId, classId });
    if (ok) { setStudentId(""); setClassId(""); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <F label="Étudiant *">
        <select value={studentId} onChange={e => setStudentId(e.target.value)} required className={selectCls}>
          <option value="">— Choisir un étudiant —</option>
          {options.students.map(s => (
            <option key={s.id} value={s.id}>
              {s.fullName} {s.studentNumber ? `· ${s.studentNumber}` : ""} ({s.email})
            </option>
          ))}
        </select>
      </F>
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Filtrer par département">
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className={selectCls}>
            <option value="">Tous les départements</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </F>
        <F label="Classe *">
          <select value={classId} onChange={e => setClassId(e.target.value)} required className={selectCls}>
            <option value="">— Choisir une classe —</option>
            {filteredClasses.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code}) · {c.capacity ?? "?"} places
              </option>
            ))}
          </select>
        </F>
      </div>
      {options.students.length === 0 && (
        <p className="text-xs text-muted">Aucun étudiant disponible. Crée d'abord des comptes via "Créer un utilisateur".</p>
      )}
      <div className="flex justify-end">
        <SubmitBtn isLoading={isLoading} icon={UsersRound} label="Inscrire dans la classe" />
      </div>
    </form>
  );
}

// ─── Formulaire : affecter un professeur ─────────────────────────────────────

function AssignTeacherForm({
  options, onSubmit, isLoading
}: {
  options: AcademicOptions;
  onSubmit: (action: string, payload: Record<string, unknown>) => Promise<boolean>;
  isLoading: boolean;
}) {
  const [teacherId, setTeacherId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [classId, setClassId] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onSubmit("assign_teacher", { teacherId, subjectId, classId });
    if (ok) { setTeacherId(""); setSubjectId(""); setClassId(""); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <F label="Professeur *">
        <select value={teacherId} onChange={e => setTeacherId(e.target.value)} required className={selectCls}>
          <option value="">— Choisir un professeur —</option>
          {options.teachers.map(t => (
            <option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>
          ))}
        </select>
      </F>
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Matière *">
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required className={selectCls}>
            <option value="">— Choisir une matière —</option>
            {options.subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </F>
        <F label="Classe (optionnel)">
          <select value={classId} onChange={e => setClassId(e.target.value)} className={selectCls}>
            <option value="">— Toutes les classes —</option>
            {options.classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </F>
      </div>
      {options.teachers.length === 0 && (
        <p className="text-xs text-muted">Aucun professeur disponible. Crée d'abord des comptes professeurs.</p>
      )}
      <div className="flex justify-end">
        <SubmitBtn isLoading={isLoading} icon={Hash} label="Affecter le professeur" />
      </div>
    </form>
  );
}

// ─── Utilitaires UI ───────────────────────────────────────────────────────────

const inputCls = "h-10 w-full rounded-xl border border-line px-3 text-sm focus:border-brand-600 focus:outline-none";
const selectCls = "h-10 w-full rounded-xl border border-line bg-white px-3 text-sm focus:border-brand-600 focus:outline-none";

function F({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-ink">{label}</span>
      {hint && <span className="mb-1 block text-[11px] text-muted">{hint}</span>}
      {children}
    </label>
  );
}

function Sel({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={selectCls}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SubmitBtn({ isLoading, icon: Icon, label }: { isLoading: boolean; icon: React.ElementType; label: string }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-500 disabled:opacity-40"
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}
