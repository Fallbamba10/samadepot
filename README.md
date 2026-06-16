# SamaDepot

Plateforme SaaS multi-tenant pour le depot et le suivi des travaux universitaires au Senegal.

## Stack

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- Supabase Auth, PostgreSQL et Storage
- Resend et WhatsApp Business API pour les notifications

## Demarrage

```bash
npm install
npm run dev
```

Copier `.env.example` vers `.env.local`, puis renseigner les variables Supabase avant de brancher les donnees reelles.
Le guide detaille est disponible dans `docs/SUPABASE_SETUP.md`.

## Verification

```bash
npm run typecheck
npm run build
```

Pendant le developpement, ne lance pas `npm run build` en meme temps que `npm run dev`.
La route `/api/health` verifie la configuration Supabase et le bucket Storage.

## Structure

- `app/` - pages et routes Next.js
- `components/` - composants UI et metier
- `lib/` - donnees, helpers et clients services
- `supabase/schema.sql` - schema PostgreSQL initial
- `docs/` - cahier des charges et artefacts projet

Les fichiers de conception originaux sont conserves a la racine pour reference.

## Production

La checklist de deploiement Vercel est dans `docs/DEPLOYMENT.md`.
