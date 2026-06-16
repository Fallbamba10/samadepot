import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
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

      {/* Comment ça marche */}
      <section className="bg-slate-50 py-16 md:py-20">
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
          <Link href="/verify" className="text-xs text-slate-400 hover:text-brand-600">Vérifier un récépissé</Link>
        </div>
      </footer>
    </div>
  );
}
