# Setup Supabase SamaDepot

Ce guide liste les actions manuelles a faire dans Supabase pour connecter l'application locale a une vraie base.

## 1. Creer le projet Supabase

1. Aller sur Supabase.
2. Creer un nouveau projet, par exemple `samadepot`.
3. Choisir une region proche de la cible de production. Pour le CDC, la region EU Frankfurt est adaptee.
4. Garder le mot de passe database dans un gestionnaire de secrets.

## 2. Executer le schema SQL

1. Ouvrir `SQL Editor`.
2. Coller le contenu de `supabase/schema.sql`.
3. Executer le script.

Le schema cree:

- les tables metier SamaDepot;
- les vues dashboard;
- les fonctions utilitaires;
- les policies RLS multi-tenant;
- les donnees test UCAD/ESP.

## 3. Creer les buckets Storage

Dans `Storage`, creer deux buckets prives:

- `submissions`
- `receipts`

Ils doivent rester prives. Les telechargements passeront par des URLs signees temporaires.

## 4. Configurer l'authentification

Dans `Authentication > Providers`:

- activer `Email`;
- desactiver l'inscription publique si tu veux que seuls les admins creent les comptes;
- configurer les URLs de redirection:
  - `http://localhost:3000`
  - `http://localhost:3000/login`
  - plus tard `https://samadepot.sn`

## 5. Copier les variables d'environnement

Creer `.env.local` a partir de `.env.example`, puis remplir:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=submissions
SUPABASE_STORAGE_BUCKET_RECEIPTS=receipts
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Important: `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais etre exposee cote client.

## 6. Premier compte admin

Pour le premier compte, le plus simple:

1. Creer l'utilisateur dans `Authentication > Users`.
2. Recuperer son `User UID`.
3. Inserer son profil dans `public.users`:

```sql
INSERT INTO public.users (
  id,
  university_id,
  email,
  full_name,
  role
) VALUES (
  '<USER_UID>',
  '00000000-0000-0000-0000-000000000001',
  'admin@ucad.edu.sn',
  'Admin UCAD',
  'admin'
);
```

Pour un superadmin, utiliser le role `superadmin`.

## 7. Verifications

Apres avoir configure `.env.local`:

```bash
npm run typecheck
npm run build
npm run dev
```

Puis tester:

- `/login`
- `/dashboard`
- `/spaces`
- `/teacher`
- `/admin`

Sans `.env.local`, l'application reste en mode demo avec des donnees mockees.
