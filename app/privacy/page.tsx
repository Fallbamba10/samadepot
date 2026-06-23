import Link from "next/link";

export const metadata = { title: "Politique de confidentialité — SamaDepot" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-slate-700">
      <Link href="/" className="mb-8 inline-block text-sm text-brand-600 hover:underline">
        ← Retour à l'accueil
      </Link>

      <h1 className="mb-2 text-3xl font-extrabold text-slate-900">
        Politique de confidentialité
      </h1>
      <p className="mb-10 text-sm text-slate-400">Dernière mise à jour : juin 2026</p>

      <Section title="1. Responsable du traitement">
        <p>
          Le responsable du traitement des données est Mouhamadou Bamba Fall, éditeur de
          SamaDepot, joignable à{" "}
          <a href="mailto:contact@samadepot.app" className="text-brand-600 hover:underline">
            contact@samadepot.app
          </a>.
        </p>
      </Section>

      <Section title="2. Données collectées">
        <ul className="list-disc space-y-1 pl-5">
          <li>Nom complet, adresse email, numéro de téléphone (optionnel)</li>
          <li>Numéro étudiant, département, niveau (pour les étudiants)</li>
          <li>Fichiers déposés sur la plateforme et leur hash SHA-256</li>
          <li>Logs d'activité (date de connexion, soumissions, évaluations)</li>
          <li>Données de paiement (traitement externalisé via PayTech — aucune carte n'est stockée chez SamaDepot)</li>
        </ul>
      </Section>

      <Section title="3. Finalités du traitement">
        <ul className="list-disc space-y-1 pl-5">
          <li>Gestion des comptes et authentification</li>
          <li>Suivi des dépôts de travaux et génération de récépissés</li>
          <li>Notifications par email (soumissions, évaluations, rappels de deadline)</li>
          <li>Facturation et gestion des abonnements</li>
          <li>Amélioration du service et statistiques agrégées</li>
        </ul>
      </Section>

      <Section title="4. Base légale">
        <p>
          Le traitement est fondé sur l'exécution du contrat de service (CGU) accepté lors
          de l'inscription, ainsi que sur l'intérêt légitime de SamaDepot à assurer la
          sécurité et la fiabilité de la plateforme.
        </p>
      </Section>

      <Section title="5. Conservation des données">
        <p>
          Les données sont conservées pendant toute la durée de l'abonnement actif, puis
          30 jours après résiliation pour permettre une éventuelle réactivation. Les fichiers
          déposés et leurs récépissés sont conservés indéfiniment sauf demande de suppression.
        </p>
      </Section>

      <Section title="6. Partage des données">
        <p>
          SamaDepot ne vend ni ne loue vos données à des tiers. Les données peuvent être
          partagées avec :
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Supabase</strong> (infrastructure base de données et stockage fichiers,
            hébergé en Europe)
          </li>
          <li>
            <strong>PayTech</strong> (traitement des paiements, Sénégal) pour les données
            de facturation
          </li>
          <li>
            <strong>Vercel</strong> (hébergement de l'application, région Paris) pour les
            logs applicatifs
          </li>
        </ul>
      </Section>

      <Section title="7. Sécurité">
        <p>
          Toutes les communications sont chiffrées via HTTPS. Les mots de passe sont gérés
          par Supabase Auth (bcrypt). Les fichiers sont stockés dans un bucket privé
          accessible uniquement via des URLs signées. Un hash SHA-256 garantit l'intégrité
          de chaque dépôt.
        </p>
      </Section>

      <Section title="8. Vos droits">
        <p>
          Conformément aux lois applicables sur la protection des données personnelles, vous
          disposez des droits suivants :
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement (« droit à l'oubli »)</li>
          <li>Droit d'opposition au traitement</li>
        </ul>
        <p className="mt-2">
          Pour exercer ces droits, contactez{" "}
          <a href="mailto:contact@samadepot.app" className="text-brand-600 hover:underline">
            contact@samadepot.app
          </a>.
        </p>
      </Section>

      <Section title="9. Cookies">
        <p>
          SamaDepot utilise uniquement des cookies fonctionnels nécessaires à
          l'authentification (session Supabase). Aucun cookie publicitaire ou de tracking
          tiers n'est utilisé.
        </p>
      </Section>

      <Section title="10. Modifications">
        <p>
          Cette politique peut être mise à jour. En cas de modification substantielle,
          les administrateurs d'université seront notifiés par email. La date de dernière
          mise à jour est indiquée en haut de cette page.
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
