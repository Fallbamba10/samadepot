-- ============================================================
-- MIGRATION — Invitations multi-rôles (étudiants + professeurs)
-- A exécuter dans Supabase SQL Editor
-- ============================================================

-- 1. Rendre class_id optionnel (les invitations prof n'ont pas de classe)
ALTER TABLE class_invitations
  ALTER COLUMN class_id DROP NOT NULL;

-- 2. Ajouter la colonne role (défaut "student" pour compatibilité)
ALTER TABLE class_invitations
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'student'
  CHECK (role IN ('student', 'teacher'));

-- 3. Mettre à jour les lignes existantes (toutes sont des invitations étudiant)
UPDATE class_invitations SET role = 'student' WHERE role IS NULL;

-- Index pour filtrer par rôle
CREATE INDEX IF NOT EXISTS idx_class_invitations_role ON class_invitations(role);
