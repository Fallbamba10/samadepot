-- ============================================================
-- FIX : Les professeurs ne voyaient pas les dépôts des étudiants
--
-- Cause : la politique RLS sur `users` n'autorisait les profs
-- qu'à voir leur propre fiche. Quand la vue v_submissions_full
-- faisait JOIN users ON u.id = s.student_id, ce JOIN retournait
-- 0 lignes pour les étudiants → 0 dépôts visibles pour le prof.
--
-- Fix : les profs (et admins) peuvent lire tous les utilisateurs
-- de leur université (nom, email, numéro étudiant).
-- ============================================================

-- Remplacer la politique existante
DROP POLICY IF EXISTS "users_read_allowed" ON users;

CREATE POLICY "users_read_allowed"
  ON users FOR SELECT
  USING (
    -- Chacun voit son propre profil
    id = auth.uid()
    -- Les profs, admins, superadmin voient tous les utilisateurs de leur université
    OR (
      current_user_role() IN ('teacher', 'admin', 'superadmin')
      AND university_id = current_university_id()
    )
    -- Superadmin voit tout
    OR is_platform_admin()
  );
