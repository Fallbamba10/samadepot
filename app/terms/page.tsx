import Link from "next/link";

export const metadata = { title: "Conditions générales d'utilisation — SamaDepot" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-slate-700">
      <Link href="/" className="mb-8 inline-block text-sm text-brand-600 hover:underline">
        ← Retour à l'accueil
      </Link>

      <h1 className="mb-2 text-3xl font-extrabold text-slate-900">
        Conditions générales d'utilisation
      </h1>
      <p className="mb-10 text-sm text-slate-400">Dernière mise à jour : juin 2026</p>

      <Section title="1. Objet">
        <p>
          SamaDepot est une plateforme SaaS de dépôt et de suivi de travaux universitaires,
          éditée par Mouhamadou Bamba Fall, basé à Dakar, Sénégal. Les présentes conditions
          régissent l'accès et l'utilisation de la plateforme accessible à l'adresse{" "}
          <a href="https://samadepot.app" className="text-brand-600 hover:underline">
            samadepot.app
          </a>.
        </p>
      </Section>

      <Section title="2. Accès au service">
        <p>
          L'accès à SamaDepot est réservé aux institutions académiques (universités, écoles,
          instituts) et à leurs membres (étudiants, enseignants, administrateurs). Chaque
          institution est responsable des comptes créés en son sein.
        </p>
      </Section>

      <Section title="3. Comptes utilisateurs">
        <p>
          Chaque utilisateur est responsable de la confidentialité de ses identifiants de
          connexion. Toute activité effectuée depuis un compte est réputée effectuée par son
          titulaire. En cas de compromission, l'utilisateur doit en informer son administrateur
          sans délai.
        </p>
      </Section>

      <Section title="4. Dépôt de fichiers">
        <p>
          Les fichiers déposés sur la plateforme restent la propriété intellectuelle de leurs
          auteurs. SamaDepot ne revendique aucun droit sur les contenus déposés. Un hash
          SHA-256 est calculé à chaque dépôt afin de garantir l'intégrité du fichier et
          d'horodater la soumission.
        </p>
      </Section>

      <Section title="5. Plans et paiements">
        <p>
          Les abonnements (Basic, Premium) sont facturés mensuellement en FCFA via la
          plateforme PayTech. Le plan Gratuit reste accessible sans engagement. En cas de
          non-paiement, l'accès aux fonctionnalités payantes est suspendu mais les données
          restent conservées pendant 30 jours.
        </p>
      </Section>

      <Section title="6. Disponibilité du service">
        <p>
          SamaDepot s'efforce de maintenir une disponibilité maximale. Des interruptions
          ponctuelles pour maintenance sont possibles et seront annoncées à l'avance dans
          la mesure du possible. Aucune garantie de disponibilité continue n'est accordée
          sur le plan Gratuit.
        </p>
      </Section>

      <Section title="7. Données personnelles">
        <p>
          La collecte et le traitement des données personnelles sont décrits dans notre{" "}
          <Link href="/privacy" className="text-brand-600 hover:underline">
            politique de confidentialité
          </Link>.
        </p>
      </Section>

      <Section title="8. Limitation de responsabilité">
        <p>
          SamaDepot ne saurait être tenu responsable des pertes de données résultant d'une
          utilisation incorrecte, de suppressions volontaires effectuées par les administrateurs,
          ou de cas de force majeure. Les données sont sauvegardées régulièrement via
          l'infrastructure Supabase.
        </p>
      </Section>

      <Section title="9. Résiliation">
        <p>
          Toute institution peut résilier son compte à tout moment en contactant le support.
          SamaDepot se réserve le droit de suspendre un compte en cas de violation des
          présentes conditions.
        </p>
      </Section>

      <Section title="10. Contact">
        <p>
          Pour toute question relative aux présentes conditions, contactez-nous à{" "}
          <a href="mailto:contact@samadepot.app" className="text-brand-600 hover:underline">
            contact@samadepot.app
          </a>.
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-bold text-slate-900">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  );
}
