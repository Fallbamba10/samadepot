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
  MessageCircle,
  Share2,
  ShieldCheck,
  Upload,
  Users
} from "lucide-react";
import { RegistrationForm } from "./registration-form";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">SD</div>
            <span className="text-base font-bold text-slate-900">SamaDepot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="hidden text-sm font-semibold text-slate-500 hover:text-slate-900 sm:block">Tarifs</Link>
            <Link href="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-900">Se connecter</Link>
            <Link href="#inscrire" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500">
              Inscrire mon école
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center md:px-8 md:py-28">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-600">
          <GraduationCap className="h-4 w-4" />
          Pensée pour les universités sénégalaises
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
          Fini les devoirs par WhatsApp,{" "}
          <span className="text-brand-600">email ou clé USB</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-500">
          SamaDepot permet à chaque professeur de créer un espace de dépôt en ligne.
          Les étudiants soumettent leurs travaux, reçoivent un récépissé horodaté,
          et le prof suit qui a rendu en temps réel.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="#inscrire"
            className="flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-500"
          >
            Inscrire mon université
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-2xl border border-slate-200 px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Se connecter
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-brand-600" /> Gratuit pour commencer</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-brand-600" /> Aucune installation</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-brand-600" /> Données hébergées en Europe</span>
        </div>
      </section>

      {/* Aperçu du produit */}
      <section className="overflow-hidden bg-slate-50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600">Le produit</p>
            <h2 className="text-2xl font-extrabold text-slate-900 md:text-3xl">Voici à quoi ça ressemble</h2>
            <p className="mt-3 text-slate-500">Simple pour les étudiants, puissant pour les enseignants.</p>
          </div>

          {/* Tab 1 — Vue prof : suivi de classe */}
          <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
            {/* Barre navigateur factice */}
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-400"/><div className="h-3 w-3 rounded-full bg-yellow-400"/><div className="h-3 w-3 rounded-full bg-green-400"/></div>
              <div className="mx-auto rounded-md bg-white border border-slate-200 px-4 py-1 text-xs text-slate-400 font-mono">samadepot.vercel.app/teacher/spaces/…</div>
            </div>
            {/* Contenu maquette */}
            <div className="p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-600">TP — Développement Web · L2 Info</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">TP React & Next.js</h3>
                  <p className="text-xs text-slate-400">Deadline : 30 juin 2026, 23:59</p>
                </div>
                <div className="flex gap-2">
                  {[
                    { label: "18 / 24", sub: "Rendus", color: "bg-brand-50 text-brand-700" },
                    { label: "3", sub: "À évaluer", color: "bg-saffron-50 text-saffron-700" },
                    { label: "6", sub: "Manquants", color: "bg-coral-50 text-coral-700" },
                  ].map(s => (
                    <div key={s.sub} className={`rounded-xl px-4 py-2 text-center ${s.color}`}>
                      <p className="text-lg font-extrabold">{s.label}</p>
                      <p className="text-[10px] font-semibold">{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Barre progression */}
              <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-600" style={{ width: "75%" }} />
              </div>
              {/* Liste étudiants */}
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                {[
                  { name: "Aminata Fall", num: "2023-INFO-041", file: "tp_react_aminata.zip", time: "28 juin, 14:32", status: "Validé", statusColor: "text-brand-600 bg-brand-50" },
                  { name: "Moussa Sarr", num: "2023-INFO-022", file: "projet_final_moussa.zip", time: "29 juin, 09:15", status: "À évaluer", statusColor: "text-saffron-600 bg-saffron-50" },
                  { name: "Khadija Diallo", num: "2023-INFO-078", file: "—", time: "—", status: "Pas rendu", statusColor: "text-slate-400 bg-slate-50" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{row.name[0]}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{row.name} <span className="ml-1 text-xs font-normal text-slate-400">{row.num}</span></p>
                      <p className="truncate text-xs text-slate-400">{row.file} {row.time !== "—" && `· ${row.time}`}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${row.statusColor}`}>{row.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2 colonnes : récépissé + formulaire dépôt */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Récépissé étudiant */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-400"/><div className="h-3 w-3 rounded-full bg-yellow-400"/><div className="h-3 w-3 rounded-full bg-green-400"/></div>
                <div className="mx-auto rounded-md bg-white border border-slate-200 px-3 py-1 text-xs text-slate-400 font-mono">…/submissions/SD-2026-00421</div>
              </div>
              <div className="p-5">
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                  <FileCheck2 className="h-3.5 w-3.5" /> Récépissé numérique
                </div>
                <h3 className="text-base font-bold text-slate-900">Dépôt SD-2026-00421</h3>
                <p className="mt-1 text-xs text-slate-400">Preuve horodatée et signée cryptographiquement</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {[
                    { l: "Étudiant", v: "Aminata Fall" },
                    { l: "Espace", v: "TP React" },
                    { l: "Date dépôt", v: "28 juin, 14:32" },
                    { l: "Statut", v: "Validé" },
                  ].map(r => (
                    <div key={r.l} className="rounded-lg border border-slate-100 p-2.5">
                      <p className="font-semibold uppercase tracking-wide text-slate-400" style={{ fontSize: "9px" }}>{r.l}</p>
                      <p className="mt-0.5 font-semibold text-slate-800">{r.v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 p-2.5">
                  <Hash className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                  <p className="break-all font-mono text-[10px] text-slate-400">a83c91e4f0b9c8d92f1b7c3e5d4a8f06e1b2c9d3…</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] py-2 text-xs font-bold text-white">
                    <Share2 className="h-3.5 w-3.5" /> WhatsApp
                  </div>
                  <div className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> Vérifier
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire dépôt */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-400"/><div className="h-3 w-3 rounded-full bg-yellow-400"/><div className="h-3 w-3 rounded-full bg-green-400"/></div>
                <div className="mx-auto rounded-md bg-white border border-slate-200 px-3 py-1 text-xs text-slate-400 font-mono">…/spaces/tp-react/submit</div>
              </div>
              <div className="p-5">
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-600">TP · L2 Info</div>
                <h3 className="text-base font-bold text-slate-900">TP React & Next.js</h3>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-red-400" />
                  Deadline : 30 juin 2026, 23:59 · <span className="font-semibold text-red-500">1 jour restant</span>
                </div>
                <div className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 bg-brand-50 py-8 text-center">
                  <Upload className="h-8 w-8 text-brand-400" />
                  <p className="text-sm font-semibold text-slate-700">Glisse ton fichier ici</p>
                  <p className="text-xs text-slate-400">PDF, ZIP, DOCX · Max 50 Mo</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[65%] rounded-full bg-brand-600 transition-all" />
                </div>
                <p className="mt-1 text-right text-[10px] text-slate-400">Envoi en cours… 65%</p>
                <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white opacity-60">
                  <Upload className="h-4 w-4" /> Confirmer le dépôt
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 className="mb-2 text-center text-2xl font-extrabold text-slate-900 md:text-3xl">Comment ça marche ?</h2>
          <p className="mb-12 text-center text-slate-500">En 3 étapes simples, sans formation requise.</p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: "1", icon: <Users className="h-6 w-6" />, title: "Le prof crée un espace", desc: "En 2 minutes : type de travail, matière, classe et date limite. Il partage le lien sur WhatsApp." },
              { step: "2", icon: <Upload className="h-6 w-6" />, title: "Les étudiants déposent", desc: "Ils déposent leur fichier depuis leur téléphone et reçoivent un récépissé officiel horodaté." },
              { step: "3", icon: <FileCheck2 className="h-6 w-6" />, title: "Le prof suit et note", desc: "Tableau de bord en temps réel : rendus, retards, non-rendus. Notation et export CSV inclus." }
            ].map(item => (
              <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">{item.icon}</div>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Étape {item.step}</span>
                </div>
                <h3 className="mb-2 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-20">
        <h2 className="mb-2 text-center text-2xl font-extrabold text-slate-900 md:text-3xl">Tout ce dont vous avez besoin</h2>
        <p className="mb-12 text-center text-slate-500">Conçu pour la réalité des universités africaines.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: <Hash className="h-5 w-5" />, title: "Récépissé SHA-256", desc: "Chaque dépôt est horodaté et signé cryptographiquement. Preuve irréfutable de soumission.", color: "brand" },
            { icon: <ShieldCheck className="h-5 w-5" />, title: "Vérification publique", desc: "N'importe qui peut vérifier un récépissé avec le numéro de dépôt.", color: "lagoon" },
            { icon: <Share2 className="h-5 w-5" />, title: "Partage WhatsApp", desc: "L'étudiant partage son récépissé directement sur WhatsApp. Adapté au contexte local.", color: "saffron" },
            { icon: <MessageCircle className="h-5 w-5" />, title: "Lien d'invitation", desc: "Le prof génère un lien, le partage. Les étudiants s'inscrivent eux-mêmes.", color: "brand" },
            { icon: <BookOpenCheck className="h-5 w-5" />, title: "Suivi de classe", desc: "Vue en temps réel : rendus, retards, non-rendus. Export CSV pour les PV.", color: "lagoon" },
            { icon: <Lock className="h-5 w-5" />, title: "Données isolées", desc: "Chaque école voit uniquement ses données. Sécurité par conception.", color: "saffron" }
          ].map(feat => {
            const colors: Record<string, string> = {
              brand: "bg-brand-50 text-brand-600",
              lagoon: "bg-lagoon-50 text-lagoon-500",
              saffron: "bg-saffron-50 text-saffron-500"
            };
            return (
              <div key={feat.title} className="rounded-2xl border border-slate-100 p-5 transition hover:border-brand-100 hover:shadow-sm">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${colors[feat.color]}`}>{feat.icon}</div>
                <h3 className="mb-1.5 text-sm font-bold text-slate-900">{feat.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Aperçu tarifs */}
      <section className="bg-slate-50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 className="mb-2 text-center text-2xl font-extrabold text-slate-900 md:text-3xl">Des tarifs adaptés au contexte local</h2>
          <p className="mb-10 text-center text-slate-500">Payez en FCFA via Orange Money ou Wave. Commencez gratuitement.</p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: "Gratuit", price: "Gratuit", desc: "10 profs · 200 étudiants · 3 Go", highlight: false },
              { name: "Basic", price: "15 000 FCFA/mois", desc: "40 profs · 1 500 étudiants · 20 Go", highlight: true, badge: "Populaire" },
              { name: "Premium", price: "35 000 FCFA/mois", desc: "Illimité · 50 Go · Support prioritaire", highlight: false }
            ].map(plan => (
              <div key={plan.name} className={`relative rounded-2xl border p-5 text-center ${plan.highlight ? "border-brand-600 bg-white shadow-lg shadow-brand-600/10" : "border-slate-200 bg-white"}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-brand-600 px-3 py-0.5 text-xs font-bold text-white">{plan.badge}</span>
                  </div>
                )}
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">{plan.name}</p>
                <p className="mt-1 text-xl font-extrabold text-slate-900">{plan.price}</p>
                <p className="mt-1.5 text-sm text-slate-500">{plan.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">
              Voir tous les détails <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bande de réassurance */}
      <section className="border-y border-slate-100 py-10">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: "100%", label: "Web, aucune app à installer" },
              { value: "SHA-256", label: "Chaque dépôt est signé" },
              { value: "FCFA", label: "Paiement local Wave & Orange Money" },
              { value: "< 2 min", label: "Pour créer un espace de dépôt" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-brand-600">{s.value}</p>
                <p className="mt-1 text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulaire inscription */}
      <section id="inscrire" className="bg-slate-900 py-16 md:py-20">
        <div className="mx-auto max-w-xl px-4 md:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold text-white md:text-3xl">Inscrire mon université</h2>
            <p className="mt-2 text-slate-400">Gratuit pendant 3 mois. Aucune carte bancaire requise.</p>
          </div>
          <RegistrationForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-xs font-bold text-white">SD</div>
            <span className="text-sm font-bold text-slate-700">SamaDepot</span>
          </div>
          <p className="text-xs text-slate-400">Plateforme de dépôt de travaux universitaires · Dakar, Sénégal</p>
          <div className="flex gap-4">
            <Link href="/verify" className="text-xs text-slate-400 hover:text-brand-600">Vérifier un récépissé</Link>
            <Link href="/pricing" className="text-xs text-slate-400 hover:text-brand-600">Tarifs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
