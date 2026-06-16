# Deploiement SamaDepot

## 1. Supabase

- Executer `supabase/schema.sql` dans le SQL editor.
- Creer le bucket Storage prive `submissions`.
- Verifier que le premier compte admin existe dans `auth.users` et `public.users`.
- Activer les domaines de redirection Auth necessaires :
  - `http://localhost:3000`
  - URL Vercel de production

## 2. Variables Vercel

Configurer les variables suivantes dans Vercel :

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=submissions
NEXT_PUBLIC_SITE_URL=
```

Les variables `SUPABASE_SERVICE_ROLE_KEY` ne doivent jamais etre exposees cote client.

## 3. Verification locale

```bash
npm run typecheck
npm run build
```

Ne pas lancer `npm run build` pendant qu'un serveur `npm run dev` tourne sur le meme dossier.

## 4. Verification production

- Ouvrir `/api/health`.
- Tester la connexion admin.
- Creer un compte etudiant.
- Creer un espace professeur.
- Deposer un fichier.
- Ouvrir le recepisse.
- Evaluer le depot cote professeur.
- Desactiver puis reactiver un compte cote admin.

## 5. Securite avant demo publique

- Regenerer la `service_role key` si elle a ete partagee.
- Garder le bucket `submissions` prive.
- Verifier que les routes `/admin` et `/teacher` redirigent les mauvais roles.
- Verifier qu'un utilisateur desactive ne peut plus acceder a l'application.
