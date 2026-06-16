# Notes D'Implementation

## Decisions prises

- Le MVP part sur Supabase Auth comme source d'identite principale.
- Les ecrans initiaux utilisent des donnees mockees pour valider l'UX avant branchement Supabase.
- L'interface vise un SaaS operationnel: dense, lisible, mobile-first, sans effet marketing inutile.

## Points a securiser avant production

- Lier `users.id` a `auth.users(id)` dans le schema Supabase.
- Completer toutes les policies RLS pour `INSERT`, `UPDATE` et `DELETE`.
- Verifier l'isolation multi-tenant sur chaque requete serveur.
- Ajouter rate limiting, validation Zod serveur et URLs signees Storage.
