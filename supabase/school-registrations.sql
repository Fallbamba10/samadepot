-- Table des demandes d'inscription d'écoles
-- À exécuter dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS school_registration_requests (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_name   text NOT NULL,
  email_domain      text NOT NULL,
  contact_name      text NOT NULL,
  contact_email     text NOT NULL,
  phone             text,
  students_count    text,
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reject_reason     text,
  university_id     uuid REFERENCES universities(id) ON DELETE SET NULL,
  processed_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Index pour trier par statut + date
CREATE INDEX IF NOT EXISTS idx_school_reg_status ON school_registration_requests(status, created_at DESC);

-- RLS : seul le service_role (admin API) peut lire/écrire
ALTER TABLE school_registration_requests ENABLE ROW LEVEL SECURITY;

-- Aucune politique publique : uniquement accessible via le service_role (API admin)
-- Les routes API utilisent createSupabaseAdminClient() qui bypasse RLS
