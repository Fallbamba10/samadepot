import Link from "next/link";
import {
  ArrowRight,
  Check,
  GraduationCap,
  HelpCircle,
  X,
  Zap
} from "lucide-react";

const PLANS = [
  {
    id: "starter",
    name: "Essai gratuit",
    price: "Gratuit",
    period: "",
    description: "Pour tester la plateforme avant de vous engager. Limites strictes.",
    cta: "Commencer gratuitement",
    ctaHref: "/#inscrire",
    highlight: false,
    features: [
      { label: "2 professeurs", included: true },
      { label: "30 étudiants", included: true },
      { label: "3 espaces de dépôt", included: true },
      { label: "1 Go de stockage", included: true },
      { label: "Récépissés SHA-256", included: true },
      { label: "Suivi de classe", included: true },
      { label: "Export CSV", included: true },
      { label: "Import CSV étudiants", included: false },
      { label: "Notifications email", included: false },
      { label: "Support", included: false },
    ]
  },
  {
    id: "basic",
    name: "Basic",
    price: "15 000",
    period: "FCFA / mois",
    description: "Pour les écoles jusqu'à 500 étudiants.",
    cta: "Inscrire mon université",
    ctaHref: "/#inscrire",
    highlight: true,
    badge: "Le plus populaire",
    features: [
      { label: "15 professeurs", included: true },
      { label: "500 étudiants", included: true },
      { label: "50 espaces de dépôt", included: true },
      { label: "10 Go de stockage", included: true },
      { label: "Récépissés SHA-256", included: true },
      { label: "Suivi de classe", included: true },
      { label: "Export CSV", included: true },
      { label: "Import CSV étudiants", included: true },
      { label: "Notifications email", included: true },
      { label: "Support par email", included: false },
    ]
  },
  {
    id: "standard",
    name: "Standard",
    price: "25 000",
    period: "FCFA / mois",
    description: "Pour les universités jusqu'à 1 500 étudiants.",
    cta: "Inscrire mon université",
    ctaHref: "/#inscrire",
    highlight: false,
    badge: "Nouveau",
    features: [
      { label: "40 professeurs", included: true },
      { label: "1 500 étudiants", included: true },
      { label: "150 espaces de dépôt", included: true },
      { label: "30 Go de stockage", included: true },
      { label: "Récépissés SHA-256", included: true },
      { label: "Suivi de classe", included: true },
      { label: "Export CSV", included: true },
      { label: "Import CSV étudiants", included: true },
      { label: "Notifications email", included: true },
      { label: "Support par email", included: true },
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: "35 000",
    period: "FCFA / mois",
    description: "Pour les grandes universités, sans aucune limite.",
    cta: "Contacter l'équipe",
    ctaHref: "mailto:contact@samadepot.app",
    highlight: false,
    features: [
      { label: "Professeurs illimités", included: true },
      { label: "Étudiants illimités", included: true },
      { label: "Espaces illimités", included: true },
      { label: "100 Go de stockage", included: true },
      { label: "Récépissés SHA-256", included: true },
      { label: "Suivi de classe", included: true },
      { label: "Export CSV", included: true },
      { label: "Import CSV étudiants", included: true },
      { label: "Notifications email", included: true },
      { label: "Support prioritaire", included: true },
    ]
  }
];

const FAQ = [
  {
    q: "À quoi sert l'essai gratuit ?",
    a: "L'essai gratuit vous permet de tester la plateforme avec 2 profs et 30 étudiants. C'est suffisant pour évaluer toutes les fonctionnalités avant de vous engager. Pour un usage réel, choisissez le plan Basic."
  },
  {
    q: "Comment fonctionne le paiement ?",
    a: "Le paiement se fait mensuellement via Orange Money, Wave ou virement bancaire. Aucune carte internationale n'est requise."
  },
  {
    q: "Que se passe-t-il si on dépasse le quota d'étudiants ?",
    a: "On vous prévient avant d'atteindre la limite. Les dépôts en cours ne sont pas interrompus. Vous pouvez passer au plan supérieur à tout moment."
  },
  {
    q: "Peut-on conserver nos données si on change de plan ?",
    a: "Oui. Toutes vos données, dépôts et récépissés sont conservés quelle que soit l'évolution de votre plan."
  },
  {
    q: "Est-ce qu'on peut tester avant de s'engager ?",
    a: "Oui. Inscrivez votre université sur le plan Starter, configurez vos classes et professeurs, et prenez votre temps pour évaluer la plateforme."
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">SD</div>
            <span className="text-base font-bold text-slate-900">SamaDepot</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-900">Se connecter</Link>
            <Link href="/#inscrire" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500">
              Inscrire mon école
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center md:px-8 md:py-20">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-600">
          <Zap className="h-4 w-4" />
          Tarifs simples, sans surprise
        </div>
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
          Un prix adapté à chaque université
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">
          Commencez gratuitement. Évoluez selon vos besoins. Payez en FCFA via Orange Money ou Wave.
        </p>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                plan.highlight
                  ? "border-brand-600 shadow-lg shadow-brand-600/10"
                  : "border-slate-200"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-brand-600 px-4 py-1 text-xs font-bold text-white">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-slate-400">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{plan.description}</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    {f.included
                      ? <Check className="h-4 w-4 shrink-0 text-brand-600" />
                      : <X className="h-4 w-4 shrink-0 text-slate-300" />
                    }
                    <span className={`text-sm ${f.included ? "text-slate-700" : "text-slate-400"}`}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.ctaHref}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
                  plan.highlight
                    ? "bg-brand-600 text-white hover:bg-brand-500"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>

        {/* Note paiement local */}
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50 px-6 py-4 text-center sm:flex-row sm:text-left">
          <GraduationCap className="h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm text-brand-700">
            <strong>Paiement 100% local</strong> — Orange Money, Wave, Free Money ou virement bancaire. Aucune carte internationale requise.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-100 bg-slate-50 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="mb-10 flex items-center justify-center gap-2">
            <HelpCircle className="h-5 w-5 text-brand-600" />
            <h2 className="text-2xl font-extrabold text-slate-900">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-2 text-sm font-bold text-slate-900">{item.q}</p>
                <p className="text-sm leading-relaxed text-slate-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-slate-900 py-14">
        <div className="mx-auto max-w-xl px-4 text-center md:px-8">
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">Prêt à moderniser votre université ?</h2>
          <p className="mt-3 text-slate-400">Commencez gratuitement, sans carte bancaire.</p>
          <Link
            href="/#inscrire"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-brand-500"
          >
            Inscrire mon université
            <ArrowRight className="h-5 w-5" />
          </Link>
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
