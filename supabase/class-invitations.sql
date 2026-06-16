-- ============================================================
-- SAMADEPOT — Liens d'invitation par classe
-- A executer dans Supabase SQL Editor apres academic-model.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS class_invitations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token         VARCHAR(128) NOT NULL UNIQUE,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  class_id      UUID NOT NULL REFERENCES academic_classes(id) ON DELETE CASCADE,
  created_by    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at    TIMESTAMPTZ,
  max_uses      INT,
  use_count     INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_class_invitations_token ON class_invitations(token);
CREATE INDEX IF NOT EXISTS idx_class_invitations_class ON class_invitations(class_id);

ALTER TABLE class_invitations ENABLE ROW LEVEL SECURITY;

-- Lecture publique des invitations actives (page /join accessible sans compte)
DROP POLICY IF EXISTS "invitations_public_read" ON class_invitations;
CREATE POLICY "invitations_public_read"
  ON class_invitations FOR SELECT
  USING (is_active = TRUE);

-- Creation par teachers/admins uniquement
DROP POLICY IF EXISTS "invitations_teacher_insert" ON class_invitations;
CREATE POLICY "invitations_teacher_insert"
  ON class_invitations FOR INSERT
  WITH CHECK (
    current_user_role() IN ('teacher', 'admin', 'superadmin')
    AND university_id = current_university_id()
  );

-- Mise a jour par le createur ou les admins
DROP POLICY IF EXISTS "invitations_owner_update" ON class_invitations;
CREATE POLICY "invitations_owner_update"
  ON class_invitations FOR UPDATE
  USING (
    created_by = auth.uid()
    OR current_user_role() IN ('admin', 'superadmin')
  );
