import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  FileCheck2,
  GraduationCap,
  Hash,
  Lock,
  Share2,
  ShieldCheck,
  Upload,
  Users,
  X,
  Smartphone,
  BarChart3,
} from "lucide-react";
import { RegistrationForm } from "./registration-form";
import { SchoolMarquee } from "./school-marquee";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white tracking-tight">SD</div>
            <span className="text-base font-bold text-slate-900">SamaDepot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="hidden text-sm font-medium text-slate-500 hover:text-slate-900 sm:block">Tarifs</Link>
            <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900">Se connecter</Link>
            <Link href="#inscrire" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-20 text-center md:px-8 md:pb-24 md:pt-28">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-600 tracking-wide">
          <GraduationCap className="h-3.5 w-3.5" />
          Plateforme éducative · Conçue pour l&apos;Afrique de l&apos;Ouest
        </div>

        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 md:text-6xl">
          Chaque devoir mérite{" "}
          <span className="text-brand-600">une preuve.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
          Dépôts horodatés, récépissés numériques, suivi de classe en temps réel.
          SamaDepot remplace WhatsApp, les emails et les clés USB.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="#inscrire"
            className="flex items-center gap-2 rounded-2xl bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500"
          >
            Inscrire mon université
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-2xl border border-slate-200 px-7 py-3.5 text-base font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Se connecter
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />Gratuit pour commencer</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />Aucune installation</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />Paiement en FCFA</span>
        </div>
      </section>

      {/* ── BANDEAU ÉCOLES ──────────────────────────────────────────── */}
      <SchoolMarquee />

      {/* ── CHIFFRES IMPACTANTS ─────────────────────────────────────── */}
      <section className="bg-slate-900 py-14">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "< 2 min", label: "Pour créer un espace de dépôt" },
              { value: "SHA-256", label: "Signature cryptographique sur chaque fichier" },
              { value: "0 litige", label: "Quand la preuve est horodatée" },
              { value: "100%", label: "Fonctionne depuis un téléphone" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-brand-500 md:text-4xl">{s.value}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AVANT / APRÈS ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600">Le problème</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Vous reconnaissez cette scène ?
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-red-100 bg-red-50 p-8">
              <p className="mb-6 text-xs font-bold uppercase tracking-widest text-red-400">Aujourd&apos;hui</p>
              <ul className="space-y-4">
                {[
                  "40 fichiers nommés « devoir_final.pdf » dans votre WhatsApp",
                  "Un étudiant jure avoir envoyé à temps. Vous n'avez aucune preuve.",
                  "Impossible de savoir en 1 clic qui a rendu, qui est en retard.",
                  "Les corrections disparaissent dans les emails, sans traçabilité.",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-red-800">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-brand-100 bg-brand-50 p-8">
              <p className="mb-6 text-xs font-bold uppercase tracking-widest text-brand-600">Avec SamaDepot</p>
              <ul className="space-y-4">
                {[
                  "Chaque dépôt est signé, horodaté, irréfutable.",
                  "L'étudiant reçoit un récépissé numérique en 3 secondes.",
                  "Le tableau de bord vous montre tout : rendu, retard, manquant.",
                  "La note et le commentaire arrivent directement à l'étudiant.",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-brand-800">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── APERÇU PRODUIT ──────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600">Le produit</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Simple. Précis. Fiable.
            </h2>
            <p className="mt-4 text-slate-500">Ce que voit le professeur. Ce que reçoit l&apos;étudiant.</p>
          </div>

          {/* Vue suivi de classe */}
          <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/8">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3.5">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="mx-auto rounded-lg border border-slate-200 bg-white px-4 py-1 font-mono text-xs text-slate-400">
                samadepot.app / suivi · TP React & Next.js
              </div>
            </div>
            <div className="p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-600">TP · L2 Informatique · UCAD</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">TP React & Next.js</h3>
                  <p className="mt-0.5 text-xs text-slate-400">Deadline : 30 juin 2026, 23:59</p>
                </div>
                <div className="flex gap-3">
                  {[
                    { label: "18/24", sub: "Rendus", bg: "bg-brand-50", text: "text-brand-700" },
                    { label: "3", sub: "À évaluer", bg: "bg-saffron-50", text: "text-saffron-700" },
                    { label: "6", sub: "Manquants", bg: "bg-coral-50", text: "text-coral-700" },
                  ].map(s => (
                    <div key={s.sub} className={`rounded-2xl px-4 py-2.5 text-center ${s.bg}`}>
                      <p className={`text-xl font-extrabold ${s.text}`}>{s.label}</p>
                      <p className={`text-[10px] font-bold ${s.text} opacity-70`}>{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-3/4 rounded-full bg-brand-600" />
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                {[
                  { name: "Aminata Fall", num: "2023-INFO-041", file: "tp_react_aminata.zip", time: "28 juin, 14:32", status: "Validé", badge: "text-brand-700 bg-brand-50" },
                  { name: "Moussa Sarr", num: "2023-INFO-022", file: "projet_final_moussa.zip", time: "29 juin, 09:15", status: "À évaluer", badge: "text-saffron-700 bg-saffron-50" },
                  { name: "Khadija Diallo", num: "2023-INFO-078", file: "—", time: "—", status: "Pas rendu", badge: "text-slate-400 bg-slate-50" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 last:border-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{row.name[0]}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{row.name} <span className="ml-1.5 text-xs font-normal text-slate-400">{row.num}</span></p>
                      <p className="truncate text-xs text-slate-400">{row.file !== "—" ? `${row.file} · ${row.time}` : "Aucun dépôt"}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${row.badge}`}>{row.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Récépissé + Formulaire */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Récépissé */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3.5">
                <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-400" /><div className="h-3 w-3 rounded-full bg-yellow-400" /><div className="h-3 w-3 rounded-full bg-green-400" /></div>
                <div className="mx-auto rounded-lg border border-slate-200 bg-white px-3 py-1 font-mono text-xs text-slate-400">…/récépissé/SD-2026-00421</div>
              </div>
              <div className="p-6">
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                  <FileCheck2 className="h-3.5 w-3.5" /> Récépissé officiel de dépôt
                </div>
                <h3 className="text-lg font-bold text-slate-900">Dépôt n° SD-2026-00421</h3>
                <p className="mt-1 text-xs text-slate-400">Preuve horodatée · Signature cryptographique SHA-256</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { l: "Étudiant", v: "Aminata Fall" },
                    { l: "Travail", v: "TP React & Next.js" },
                    { l: "Déposé le", v: "28 juin 2026, 14:32" },
                    { l: "Statut", v: "✓ Validé" },
                  ].map(r => (
                    <div key={r.l} className="rounded-xl border border-slate-100 p-3">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{r.l}</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-800">{r.v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                  <Hash className="h-3.5 w-3.5 shrink-0 text-brand-600" />
                  <p className="break-all font-mono text-[10px] text-slate-400">a83c91e4f0b9c8d…2f1b7c3e5d4a8f06</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] py-2.5 text-xs font-bold text-white">
                    <Share2 className="h-3.5 w-3.5" /> Partager
                  </div>
                  <div className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> Vérifier
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire dépôt */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3.5">
                <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-400" /><div className="h-3 w-3 rounded-full bg-yellow-400" /><div className="h-3 w-3 rounded-full bg-green-400" /></div>
                <div className="mx-auto rounded-lg border border-slate-200 bg-white px-3 py-1 font-mono text-xs text-slate-400">…/espaces/tp-react/deposer</div>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-600">TP · L2 Informatique</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">TP React & Next.js</h3>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-red-400" />
                  Deadline : 30 juin 2026 · <span className="font-semibold text-red-500">1 jour restant</span>
                </div>
                <div className="mt-5 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 py-10 text-center">
                  <Upload className="h-9 w-9 text-brand-400" />
                  <p className="text-sm font-semibold text-slate-700">Glisse ton fichier ici</p>
                  <p className="text-xs text-slate-400">PDF, ZIP, DOCX · Max 50 Mo</p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[65%] rounded-full bg-brand-600 transition-all" />
                </div>
                <p className="mt-1 text-right text-[10px] text-slate-400">Envoi en cours… 65%</p>
                <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3 text-sm font-bold text-white opacity-50">
                  <Upload className="h-4 w-4" /> Confirmer le dépôt
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ───────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600">Mise en place</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Opérationnel en 3 étapes
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: <Users className="h-5 w-5" />,
                title: "Le prof crée l'espace",
                desc: "Matière, classe, deadline. Ça prend 2 minutes. Il envoie le lien sur WhatsApp.",
              },
              {
                step: "02",
                icon: <Upload className="h-5 w-5" />,
                title: "Les étudiants déposent",
                desc: "Depuis leur téléphone, sans compte compliqué. Ils reçoivent un récépissé immédiat.",
              },
              {
                step: "03",
                icon: <BookOpenCheck className="h-5 w-5" />,
                title: "Le prof suit et note",
                desc: "Tableau en temps réel. Notation directe sur la plateforme. Export CSV en 1 clic.",
              },
            ].map(item => (
              <div key={item.step} className="group relative rounded-3xl border border-slate-100 p-7 transition hover:border-brand-100 hover:shadow-md">
                <div className="mb-1 text-4xl font-black text-slate-100 transition group-hover:text-brand-100">{item.step}</div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS ─────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600">Fonctionnalités</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Construit pour la réalité africaine
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Hash className="h-5 w-5" />,
                title: "Signature SHA-256",
                desc: "Chaque fichier est empreint cryptographiquement. La preuve est inaltérable, vérifiable par n'importe qui.",
                accent: "brand",
              },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: "Vérification publique",
                desc: "Un récépissé se vérifie avec juste son numéro. Sans compte, sans connexion. Ouvert à tous.",
                accent: "lagoon",
              },
              {
                icon: <Share2 className="h-5 w-5" />,
                title: "Partage WhatsApp",
                desc: "L'étudiant partage son récépissé en un tap. Là où la communication se passe déjà.",
                accent: "saffron",
              },
              {
                icon: <Smartphone className="h-5 w-5" />,
                title: "100% mobile",
                desc: "Navigateur uniquement. Pas d'app, pas d'installation. Fonctionne sur n'importe quel téléphone.",
                accent: "brand",
              },
              {
                icon: <BarChart3 className="h-5 w-5" />,
                title: "Suivi de classe",
                desc: "Rendus, retards, manquants — tout visible d'un coup d'œil. Export CSV pour les PV.",
                accent: "lagoon",
              },
              {
                icon: <Lock className="h-5 w-5" />,
                title: "Isolation par institution",
                desc: "Les données de votre école n'appartiennent qu'à vous. Isolation technique complète.",
                accent: "saffron",
              },
            ].map(feat => {
              const styles: Record<string, { wrap: string; icon: string }> = {
                brand:  { wrap: "border-brand-100  hover:bg-brand-50",  icon: "bg-brand-600  text-white" },
                lagoon: { wrap: "border-lagoon-100 hover:bg-lagoon-50", icon: "bg-lagoon-500 text-white" },
                saffron:{ wrap: "border-saffron-50 hover:bg-saffron-50",icon: "bg-saffron-500 text-white" },
              };
              return (
                <div key={feat.title} className={`rounded-3xl border bg-white p-6 transition ${styles[feat.accent].wrap}`}>
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${styles[feat.accent].icon}`}>
                    {feat.icon}
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CITATION IMPACTANTE ─────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
          <div className="mb-6 text-5xl text-brand-200 font-serif leading-none">&ldquo;</div>
          <p className="text-xl font-semibold leading-relaxed text-slate-700 md:text-2xl">
            Un professeur ne devrait pas passer sa nuit à récupérer des fichiers sur WhatsApp.
            Un étudiant ne devrait pas avoir à prouver qu&apos;il a rendu à temps.
          </p>
          <p className="mt-6 text-sm font-semibold text-brand-600">
            SamaDepot résout les deux.
          </p>
        </div>
      </section>

      {/* ── TARIFS ──────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600">Tarifs</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Payez en FCFA. Commencez gratuitement.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Gratuit",
                price: "Gratuit",
                sub: "Pour toujours",
                details: ["10 professeurs", "200 étudiants", "3 Go de stockage"],
                cta: "Commencer",
                highlight: false,
              },
              {
                name: "Basic",
                price: "15 000 FCFA",
                sub: "par mois",
                details: ["40 professeurs", "1 500 étudiants", "20 Go de stockage"],
                cta: "Choisir Basic",
                highlight: true,
                badge: "Le plus populaire",
              },
              {
                name: "Premium",
                price: "35 000 FCFA",
                sub: "par mois",
                details: ["Professeurs illimités", "Étudiants illimités", "50 Go de stockage"],
                cta: "Choisir Premium",
                highlight: false,
              },
            ].map(plan => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl border p-7 ${plan.highlight ? "border-brand-600 bg-white shadow-xl shadow-brand-600/10" : "border-slate-200 bg-white"}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-600 px-4 py-1 text-xs font-bold text-white">
                    {plan.badge}
                  </div>
                )}
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{plan.name}</p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-xs text-slate-400">{plan.sub}</span>
                </div>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.details.map(d => (
                    <li key={d} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" />
                      {d}
                    </li>
                  ))}
                </ul>
                <Link
                  href="#inscrire"
                  className={`mt-6 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition ${plan.highlight ? "bg-brand-600 text-white hover:bg-brand-500" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">
            Orange Money · Wave · Virement bancaire · Aucune carte internationale requise.
          </p>
          <div className="mt-3 text-center">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">
              Voir toutes les fonctionnalités <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────────── */}
      <section id="inscrire" className="bg-slate-900 py-20 md:py-28">
        <div className="mx-auto max-w-xl px-4 md:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">
              Votre université mérite mieux.
            </h2>
            <p className="mt-3 text-slate-400">Gratuit, sans carte bancaire. Opérationnel en 5 minutes.</p>
          </div>
          <RegistrationForm />
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">SD</div>
                <span className="text-base font-bold text-slate-900">SamaDepot</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Plateforme de dépôt de travaux universitaires.<br />
                Conçue pour les institutions d&apos;Afrique de l&apos;Ouest.
              </p>
              <p className="mt-2 text-xs text-slate-400">📍 Dakar, Sénégal</p>
            </div>

            <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
              <div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Produit</p>
                <ul className="space-y-2.5">
                  <li><Link href="/pricing" className="text-slate-500 hover:text-brand-600">Tarifs</Link></li>
                  <li><Link href="/verify" className="text-slate-500 hover:text-brand-600">Vérifier un récépissé</Link></li>
                  <li><Link href="/login" className="text-slate-500 hover:text-brand-600">Se connecter</Link></li>
                </ul>
              </div>
              <div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rejoindre</p>
                <ul className="space-y-2.5">
                  <li><Link href="#inscrire" className="text-slate-500 hover:text-brand-600">Inscrire mon école</Link></li>
                  <li><Link href="/pricing" className="text-slate-500 hover:text-brand-600">Voir les plans</Link></li>
                </ul>
              </div>
              <div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact</p>
                <ul className="space-y-2.5">
                  <li>
                    <a href="mailto:contact@samadepot.app" className="text-slate-500 hover:text-brand-600">
                      contact@samadepot.app
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            © 2026 SamaDepot · Tous droits réservés
          </div>
        </div>
      </footer>

    </div>
  );
}
