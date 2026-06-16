-- ============================================================
--  SAMADEPOT — Schéma PostgreSQL complet
--  Plateforme nationale de dépôt scolaire — Sénégal
--  À exécuter dans : Supabase > SQL Editor > New Query
--  Version : 1.0.0
-- ============================================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 0. NETTOYAGE (si re-exécution)
-- ============================================================
DROP TABLE IF EXISTS audit_logs        CASCADE;
DROP TABLE IF EXISTS notifications     CASCADE;
DROP TABLE IF EXISTS reviews           CASCADE;
DROP TABLE IF EXISTS submissions       CASCADE;
DROP TABLE IF EXISTS submission_spaces CASCADE;
DROP TABLE IF EXISTS departments       CASCADE;
DROP TABLE IF EXISTS users             CASCADE;
DROP TABLE IF EXISTS universities      CASCADE;

DROP TYPE IF EXISTS user_role          CASCADE;
DROP TYPE IF EXISTS space_type         CASCADE;
DROP TYPE IF EXISTS submission_status  CASCADE;
DROP TYPE IF EXISTS review_decision    CASCADE;
DROP TYPE IF EXISTS notification_type  CASCADE;
DROP TYPE IF EXISTS notification_channel CASCADE;
DROP TYPE IF EXISTS university_plan    CASCADE;

-- ============================================================
-- 1. TYPES ENUM
-- ============================================================

-- Rôles utilisateurs
CREATE TYPE user_role AS ENUM (
  'student',      -- Étudiant
  'teacher',      -- Professeur / Encadreur
  'admin',        -- Admin université
  'superadmin'    -- Toi (plateforme globale)
);

-- Types d'espaces de dépôt
CREATE TYPE space_type AS ENUM (
  'devoir',         -- Devoir maison
  'examen',         -- Examen
  'tp',             -- Travaux pratiques
  'rapport_stage',  -- Rapport de stage
  'pfe',            -- Projet de fin d'études (soutenance)
  'memoire',        -- Mémoire / Thèse
  'expose',         -- Exposé / Présentation
  'autre'           -- Autre
);

-- Statuts d'un dépôt
CREATE TYPE submission_status AS ENUM (
  'received',   -- Reçu — fichier uploadé
  'read',       -- Lu — prof a ouvert la fiche
  'validated',  -- Validé — prof a accepté
  'graded',     -- Noté — prof a donné une note
  'returned',   -- Retourné — prof demande corrections
  'rejected',   -- Rejeté — refusé définitivement
  'late'        -- Reçu hors délai
);

-- Décisions du professeur
CREATE TYPE review_decision AS ENUM (
  'validate',  -- Accepter le dépôt
  'grade',     -- Accepter + mettre une note
  'return',    -- Retourner pour corrections
  'reject'     -- Rejeter définitivement
);

-- Types de notifications
CREATE TYPE notification_type AS ENUM (
  'submission_received',   -- Nouveau dépôt reçu (pour prof)
  'submission_validated',  -- Dépôt validé (pour étudiant)
  'submission_graded',     -- Note reçue (pour étudiant)
  'submission_returned',   -- Dépôt retourné (pour étudiant)
  'submission_rejected',   -- Dépôt rejeté (pour étudiant)
  'deadline_reminder',     -- Rappel deadline (pour étudiant)
  'space_created',         -- Nouvel espace créé (pour étudiant)
  'welcome'                -- Bienvenue sur SamaDepot
);

-- Canaux de notification
CREATE TYPE notification_channel AS ENUM (
  'whatsapp',
  'email',
  'in_app'
);

-- Plans d'abonnement
CREATE TYPE university_plan AS ENUM (
  'free',      -- Gratuit (3 mois d'essai)
  'basic',     -- Basique
  'standard',  -- Standard
  'premium'    -- Premium illimité
);

-- ============================================================
-- 2. TABLE UNIVERSITIES (root multi-tenant)
-- ============================================================
CREATE TABLE universities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(150) NOT NULL,
  slug            VARCHAR(60)  NOT NULL UNIQUE,   -- ex: ucad, esp, ism
  email_domain    VARCHAR(100) NOT NULL UNIQUE,    -- ex: ucad.edu.sn
  logo_url        TEXT,
  website         VARCHAR(200),
  address         TEXT,
  phone           VARCHAR(20),
  plan            university_plan NOT NULL DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  max_storage_gb  INTEGER NOT NULL DEFAULT 5,      -- Quota stockage en Go
  used_storage_mb BIGINT  NOT NULL DEFAULT 0,      -- Stockage utilisé en Mo
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE universities IS 'Un enregistrement par université inscrite sur SamaDepot';
COMMENT ON COLUMN universities.email_domain IS 'Domaine email officiel — permet la détection auto de l université lors de la connexion';
COMMENT ON COLUMN universities.slug IS 'Identifiant court unique — utilisé dans les URLs';

-- ============================================================
-- 3. TABLE USERS
-- ============================================================
CREATE TABLE users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id   UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  email           VARCHAR(150) NOT NULL UNIQUE,
  full_name       VARCHAR(100) NOT NULL,
  role            user_role    NOT NULL DEFAULT 'student',
  phone           VARCHAR(20),                -- Pour WhatsApp
  student_number  VARCHAR(30),               -- Numéro étudiant (si student)
  department_code VARCHAR(20),               -- Code filière/département
  level           VARCHAR(20),               -- L1, L2, L3, M1, M2, Doctorat
  avatar_url      TEXT,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_university ON users(university_id);
CREATE INDEX idx_users_email      ON users(email);
CREATE INDEX idx_users_role       ON users(role);

COMMENT ON TABLE users IS 'Tous les utilisateurs : étudiants, profs, admins, superadmin';
COMMENT ON COLUMN users.phone IS 'Numéro WhatsApp pour les notifications — format international (+221...)';

-- ============================================================
-- 4. TABLE DEPARTMENTS
-- ============================================================
CREATE TABLE departments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID        NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,   -- ex: Informatique, Gestion, Droit
  code          VARCHAR(20)  NOT NULL,   -- ex: INFO, GEST, DROIT
  levels        TEXT[]       NOT NULL DEFAULT ARRAY['L1','L2','L3'],
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(university_id, code)
);

CREATE INDEX idx_departments_university ON departments(university_id);

COMMENT ON TABLE departments IS 'Filières et départements de chaque université';

-- ============================================================
-- 5. TABLE SUBMISSION_SPACES
-- ============================================================
CREATE TABLE submission_spaces (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id   UUID        NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  teacher_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id   UUID        REFERENCES departments(id) ON DELETE SET NULL,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  type            space_type   NOT NULL,
  target_level    VARCHAR(20),                           -- L3, M1, etc. (NULL = tous)
  deadline        TIMESTAMPTZ  NOT NULL,
  formats_allowed TEXT[]       NOT NULL DEFAULT ARRAY['pdf','docx','pptx','zip'],
  max_size_mb     INTEGER      NOT NULL DEFAULT 50,
  allow_late      BOOLEAN      NOT NULL DEFAULT FALSE,   -- Accepter les retards ?
  allow_resubmit  BOOLEAN      NOT NULL DEFAULT TRUE,    -- Autoriser le re-dépôt ?
  access_code     VARCHAR(8)   UNIQUE,                   -- Code optionnel pour accéder à l'espace
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_spaces_university ON submission_spaces(university_id);
CREATE INDEX idx_spaces_teacher    ON submission_spaces(teacher_id);
CREATE INDEX idx_spaces_deadline   ON submission_spaces(deadline);
CREATE INDEX idx_spaces_active     ON submission_spaces(is_active);

COMMENT ON TABLE submission_spaces IS 'Espaces de dépôt créés par les professeurs';
COMMENT ON COLUMN submission_spaces.access_code IS 'Code optionnel — le prof le partage aux étudiants pour accéder à l espace';

-- ============================================================
-- 6. TABLE SUBMISSIONS (table centrale ❤️)
-- ============================================================
CREATE TABLE submissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id        UUID              NOT NULL REFERENCES submission_spaces(id) ON DELETE CASCADE,
  student_id      UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  university_id   UUID              NOT NULL REFERENCES universities(id) ON DELETE CASCADE,

  -- Fichier
  file_name       VARCHAR(255) NOT NULL,        -- Nom original du fichier
  file_url        TEXT         NOT NULL,         -- URL Supabase Storage (privé)
  file_size_mb    DECIMAL(8,2) NOT NULL,
  file_mime_type  VARCHAR(100) NOT NULL,
  file_hash       VARCHAR(64)  NOT NULL,         -- SHA-256 pour l'intégrité + récépissé

  -- Statut
  status          submission_status NOT NULL DEFAULT 'received',
  is_late         BOOLEAN           NOT NULL DEFAULT FALSE,
  version         INTEGER           NOT NULL DEFAULT 1,   -- Numéro de version (re-dépôt)
  parent_id       UUID              REFERENCES submissions(id), -- Si re-dépôt

  -- Métadonnées
  student_comment TEXT,                          -- Note optionnelle de l'étudiant
  receipt_url     TEXT,                          -- URL du récépissé PDF généré
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_submissions_space     ON submissions(space_id);
CREATE INDEX idx_submissions_student   ON submissions(student_id);
CREATE INDEX idx_submissions_university ON submissions(university_id);
CREATE INDEX idx_submissions_status    ON submissions(status);
CREATE INDEX idx_submissions_submitted ON submissions(submitted_at DESC);

-- Contrainte : un étudiant ne peut déposer qu'une fois par espace (sauf re-dépôt)
CREATE UNIQUE INDEX idx_submissions_unique
  ON submissions(space_id, student_id)
  WHERE parent_id IS NULL;

COMMENT ON TABLE submissions IS 'Fichiers déposés par les étudiants — table centrale du projet';
COMMENT ON COLUMN submissions.file_hash IS 'SHA-256 du fichier — garantit l intégrité et sert de preuve sur le récépissé';
COMMENT ON COLUMN submissions.version IS 'Version 1 = premier dépôt, 2+ = re-dépôt après retour du prof';

-- ============================================================
-- 7. TABLE REVIEWS (retour du professeur)
-- ============================================================
CREATE TABLE reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID              NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  teacher_id    UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  decision      review_decision   NOT NULL,
  grade         DECIMAL(4,2),                  -- Note sur 20 (NULL si pas de note)
  grade_max     DECIMAL(4,2) DEFAULT 20,        -- Note max (20 par défaut)
  comment       TEXT,                           -- Commentaire / remarques du prof
  is_visible    BOOLEAN NOT NULL DEFAULT TRUE,  -- Visible par l'étudiant ?
  reviewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_grade CHECK (grade IS NULL OR (grade >= 0 AND grade <= grade_max))
);

CREATE INDEX idx_reviews_submission ON reviews(submission_id);
CREATE INDEX idx_reviews_teacher    ON reviews(teacher_id);

COMMENT ON TABLE reviews IS 'Évaluation d un dépôt par le professeur';

-- ============================================================
-- 8. TABLE NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID                 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  university_id UUID                 NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  submission_id UUID                 REFERENCES submissions(id) ON DELETE SET NULL,
  type          notification_type    NOT NULL,
  channel       notification_channel NOT NULL,
  content       TEXT                 NOT NULL,
  metadata      JSONB,                          -- Données supplémentaires (ex: nom fichier, note)
  is_sent       BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at       TIMESTAMPTZ,
  read_at       TIMESTAMPTZ,
  error_message TEXT,                           -- Si envoi échoué
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifs_user       ON notifications(user_id);
CREATE INDEX idx_notifs_university ON notifications(university_id);
CREATE INDEX idx_notifs_sent       ON notifications(is_sent, created_at);
CREATE INDEX idx_notifs_read       ON notifications(read_at) WHERE read_at IS NULL;

COMMENT ON TABLE notifications IS 'Historique de toutes les notifications (WhatsApp, email, in-app)';

-- ============================================================
-- 9. TABLE AUDIT_LOGS (traçabilité complète)
-- ============================================================
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        REFERENCES users(id) ON DELETE SET NULL,
  university_id UUID        REFERENCES universities(id) ON DELETE SET NULL,
  action        VARCHAR(60) NOT NULL,   -- ex: SUBMIT_FILE, REVIEW_SUBMISSION, LOGIN
  resource_type VARCHAR(50),            -- ex: submission, space, user
  resource_id   UUID,
  old_value     JSONB,                  -- Valeur avant modification
  new_value     JSONB,                  -- Valeur après modification
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user       ON audit_logs(user_id);
CREATE INDEX idx_audit_university ON audit_logs(university_id);
CREATE INDEX idx_audit_action     ON audit_logs(action);
CREATE INDEX idx_audit_created    ON audit_logs(created_at DESC);

COMMENT ON TABLE audit_logs IS 'Traçabilité complète — chaque action importante est enregistrée';

-- ============================================================
-- 10. TRIGGERS — updated_at automatique
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_universities
  BEFORE UPDATE ON universities
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_spaces
  BEFORE UPDATE ON submission_spaces
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_submissions
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- 11. FONCTION — Détection université par domaine email
-- ============================================================
CREATE OR REPLACE FUNCTION get_university_by_email(p_email TEXT)
RETURNS TABLE(university_id UUID, university_name TEXT, university_slug TEXT)
AS $$
DECLARE
  v_domain TEXT;
BEGIN
  -- Extraire le domaine (ex: ucad.edu.sn depuis prenom.nom@ucad.edu.sn)
  v_domain := LOWER(SPLIT_PART(p_email, '@', 2));

  RETURN QUERY
  SELECT u.id, u.name, u.slug
  FROM universities u
  WHERE LOWER(u.email_domain) = v_domain
    AND u.is_active = TRUE
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_university_by_email IS
  'Detecte automatiquement l université d un utilisateur depuis son adresse email';

-- ============================================================
-- 12. FONCTION — Statut de deadline d'un espace
-- ============================================================
CREATE OR REPLACE FUNCTION get_space_deadline_status(p_deadline TIMESTAMPTZ)
RETURNS TEXT AS $$
DECLARE
  v_diff INTERVAL;
BEGIN
  v_diff := p_deadline - NOW();
  IF v_diff < INTERVAL '0' THEN
    RETURN 'expired';   -- Délai dépassé
  ELSIF v_diff < INTERVAL '24 hours' THEN
    RETURN 'urgent';    -- Moins de 24h
  ELSIF v_diff < INTERVAL '72 hours' THEN
    RETURN 'soon';      -- Moins de 3 jours
  ELSE
    RETURN 'open';      -- Délai confortable
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 13. FONCTION — Mettre à jour le stockage utilisé
-- ============================================================
CREATE OR REPLACE FUNCTION update_university_storage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE universities
    SET used_storage_mb = used_storage_mb + NEW.file_size_mb
    WHERE id = NEW.university_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE universities
    SET used_storage_mb = GREATEST(0, used_storage_mb - OLD.file_size_mb)
    WHERE id = OLD.university_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_storage
  AFTER INSERT OR DELETE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_university_storage();

-- ============================================================
-- 14. VUES UTILES
-- ============================================================

-- Vue : dépôts avec infos complètes (pour le dashboard prof)
CREATE VIEW v_submissions_full AS
SELECT
  s.id,
  s.space_id,
  s.status,
  s.is_late,
  s.version,
  s.file_name,
  s.file_size_mb,
  s.file_hash,
  s.student_comment,
  s.submitted_at,
  -- Étudiant
  u.full_name        AS student_name,
  u.email            AS student_email,
  u.student_number,
  u.department_code,
  u.level            AS student_level,
  u.phone            AS student_phone,
  -- Espace
  ss.title           AS space_title,
  ss.type            AS space_type,
  ss.deadline,
  get_space_deadline_status(ss.deadline) AS deadline_status,
  -- Review (si existe)
  r.decision,
  r.grade,
  r.grade_max,
  r.comment          AS review_comment,
  r.reviewed_at
FROM submissions s
JOIN users u              ON u.id = s.student_id
JOIN submission_spaces ss ON ss.id = s.space_id
LEFT JOIN reviews r       ON r.submission_id = s.id;

-- Vue : statistiques par université (pour dashboard admin)
CREATE VIEW v_university_stats AS
SELECT
  uni.id,
  uni.name,
  uni.slug,
  uni.plan,
  uni.used_storage_mb,
  uni.max_storage_gb,
  COUNT(DISTINCT u.id)   FILTER (WHERE u.role = 'student') AS total_students,
  COUNT(DISTINCT u.id)   FILTER (WHERE u.role = 'teacher') AS total_teachers,
  COUNT(DISTINCT ss.id)                                      AS total_spaces,
  COUNT(DISTINCT sub.id)                                     AS total_submissions,
  COUNT(DISTINCT sub.id) FILTER (WHERE sub.status = 'received')   AS pending_submissions,
  COUNT(DISTINCT sub.id) FILTER (WHERE sub.status = 'validated')  AS validated_submissions,
  COUNT(DISTINCT sub.id) FILTER (WHERE sub.status = 'graded')     AS graded_submissions,
  COUNT(DISTINCT sub.id) FILTER (WHERE sub.submitted_at >= NOW() - INTERVAL '24 hours') AS submissions_today
FROM universities uni
LEFT JOIN users u              ON u.university_id = uni.id
LEFT JOIN submission_spaces ss ON ss.university_id = uni.id
LEFT JOIN submissions sub      ON sub.university_id = uni.id
GROUP BY uni.id, uni.name, uni.slug, uni.plan, uni.used_storage_mb, uni.max_storage_gb;

-- Vue : espaces actifs avec compteur de dépôts (pour étudiant)
CREATE VIEW v_active_spaces AS
SELECT
  ss.id,
  ss.university_id,
  ss.teacher_id,
  ss.title,
  ss.description,
  ss.type,
  ss.target_level,
  ss.deadline,
  ss.formats_allowed,
  ss.max_size_mb,
  ss.allow_late,
  ss.allow_resubmit,
  ss.access_code,
  get_space_deadline_status(ss.deadline) AS deadline_status,
  u.full_name AS teacher_name,
  d.name      AS department_name,
  COUNT(sub.id) AS submission_count
FROM submission_spaces ss
JOIN users u         ON u.id = ss.teacher_id
LEFT JOIN departments d   ON d.id = ss.department_id
LEFT JOIN submissions sub ON sub.space_id = ss.id
WHERE ss.is_active = TRUE
GROUP BY ss.id, u.full_name, d.name;

-- Les vues doivent respecter le RLS de l'utilisateur appelant.
-- Sans security_invoker, PostgreSQL peut les executer avec les droits du proprietaire.
ALTER VIEW v_submissions_full SET (security_invoker = true);
ALTER VIEW v_university_stats  SET (security_invoker = true);
ALTER VIEW v_active_spaces     SET (security_invoker = true);

-- ============================================================
-- 15. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE universities      ENABLE ROW LEVEL SECURITY;
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs        ENABLE ROW LEVEL SECURITY;

-- Service role bypasse le RLS. A utiliser uniquement cote serveur pour les actions admin.
-- Les policies ci-dessous s'appliquent aux utilisateurs authentifies via Supabase Auth.

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid() AND is_active = TRUE;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION current_university_id()
RETURNS UUID AS $$
  SELECT university_id FROM public.users WHERE id = auth.uid() AND is_active = TRUE;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT current_user_role() = 'superadmin';
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION is_university_admin()
RETURNS BOOLEAN AS $$
  SELECT current_user_role() IN ('admin', 'superadmin');
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION can_manage_space(p_space_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.submission_spaces ss
    WHERE ss.id = p_space_id
      AND (
        ss.teacher_id = auth.uid()
        OR (
          current_user_role() = 'admin'
          AND ss.university_id = current_university_id()
        )
        OR is_platform_admin()
      )
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Universities : lecture publique des infos de base
CREATE POLICY "universities_read_public"
  ON universities FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "universities_superadmin_write"
  ON universities FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- Users : chaque utilisateur voit son profil; admin voit son universite; superadmin voit tout.
CREATE POLICY "users_read_allowed"
  ON users FOR SELECT
  USING (
    id = auth.uid()
    OR (
      current_user_role() = 'admin'
      AND university_id = current_university_id()
    )
    OR is_platform_admin()
  );

CREATE POLICY "users_admin_insert"
  ON users FOR INSERT
  WITH CHECK (
    (
      current_user_role() = 'admin'
      AND university_id = current_university_id()
      AND role IN ('student', 'teacher')
    )
    OR is_platform_admin()
  );

CREATE POLICY "users_update_allowed"
  ON users FOR UPDATE
  USING (
    id = auth.uid()
    OR (
      current_user_role() = 'admin'
      AND university_id = current_university_id()
      AND role IN ('student', 'teacher')
    )
    OR is_platform_admin()
  )
  WITH CHECK (
    id = auth.uid()
    OR (
      current_user_role() = 'admin'
      AND university_id = current_university_id()
      AND role IN ('student', 'teacher')
    )
    OR is_platform_admin()
  );

-- Departments : lecture par universite; admin gere son universite.
CREATE POLICY "departments_read_same_university"
  ON departments FOR SELECT
  USING (university_id = current_university_id() OR is_platform_admin());

CREATE POLICY "departments_admin_write"
  ON departments FOR ALL
  USING (
    (current_user_role() = 'admin' AND university_id = current_university_id())
    OR is_platform_admin()
  )
  WITH CHECK (
    (current_user_role() = 'admin' AND university_id = current_university_id())
    OR is_platform_admin()
  );

-- Submission spaces : etudiants lisent les espaces actifs de leur universite;
-- profs gerent leurs espaces; admins gerent l'universite.
CREATE POLICY "spaces_read_allowed"
  ON submission_spaces FOR SELECT
  USING (
    university_id = current_university_id()
    OR is_platform_admin()
  );

CREATE POLICY "spaces_insert_teacher_admin"
  ON submission_spaces FOR INSERT
  WITH CHECK (
    university_id = current_university_id()
    AND (
      teacher_id = auth.uid()
      OR current_user_role() = 'admin'
    )
    OR is_platform_admin()
  );

CREATE POLICY "spaces_update_owner_admin"
  ON submission_spaces FOR UPDATE
  USING (
    teacher_id = auth.uid()
    OR (
      current_user_role() = 'admin'
      AND university_id = current_university_id()
    )
    OR is_platform_admin()
  )
  WITH CHECK (
    teacher_id = auth.uid()
    OR (
      current_user_role() = 'admin'
      AND university_id = current_university_id()
    )
    OR is_platform_admin()
  );

CREATE POLICY "spaces_delete_owner_admin"
  ON submission_spaces FOR DELETE
  USING (
    teacher_id = auth.uid()
    OR (
      current_user_role() = 'admin'
      AND university_id = current_university_id()
    )
    OR is_platform_admin()
  );

-- Submissions : étudiant voit seulement les siennes
CREATE POLICY "submissions_student_own"
  ON submissions FOR SELECT
  USING (student_id = auth.uid());

-- Submissions : prof voit celles de ses espaces
CREATE POLICY "submissions_teacher_spaces"
  ON submissions FOR SELECT
  USING (can_manage_space(space_id));

CREATE POLICY "submissions_admin_same_university"
  ON submissions FOR SELECT
  USING (
    (current_user_role() = 'admin' AND university_id = current_university_id())
    OR is_platform_admin()
  );

CREATE POLICY "submissions_student_insert_own"
  ON submissions FOR INSERT
  WITH CHECK (
    student_id = auth.uid()
    AND university_id = current_university_id()
    AND EXISTS (
      SELECT 1
      FROM submission_spaces ss
      WHERE ss.id = space_id
        AND ss.university_id = current_university_id()
        AND ss.is_active = TRUE
    )
  );

CREATE POLICY "submissions_student_delete_received"
  ON submissions FOR DELETE
  USING (
    student_id = auth.uid()
    AND status = 'received'
  );

CREATE POLICY "submissions_teacher_admin_update"
  ON submissions FOR UPDATE
  USING (
    can_manage_space(space_id)
    OR (
      current_user_role() = 'admin'
      AND university_id = current_university_id()
    )
    OR is_platform_admin()
  )
  WITH CHECK (
    can_manage_space(space_id)
    OR (
      current_user_role() = 'admin'
      AND university_id = current_university_id()
    )
    OR is_platform_admin()
  );

-- Reviews : visibles par l'etudiant concerne, le prof proprietaire, admin et superadmin.
CREATE POLICY "reviews_read_allowed"
  ON reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM submissions s
      WHERE s.id = submission_id
        AND (
          s.student_id = auth.uid()
          OR can_manage_space(s.space_id)
          OR (
            current_user_role() = 'admin'
            AND s.university_id = current_university_id()
          )
          OR is_platform_admin()
        )
    )
  );

CREATE POLICY "reviews_teacher_insert"
  ON reviews FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM submissions s
      WHERE s.id = submission_id
        AND can_manage_space(s.space_id)
    )
  );

CREATE POLICY "reviews_teacher_update_24h"
  ON reviews FOR UPDATE
  USING (
    teacher_id = auth.uid()
    AND reviewed_at >= NOW() - INTERVAL '24 hours'
  )
  WITH CHECK (
    teacher_id = auth.uid()
    AND reviewed_at >= NOW() - INTERVAL '24 hours'
  );

-- Notifications : chaque user voit les siennes
CREATE POLICY "notifications_own"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications_mark_read_own"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Audit logs : consultables par admin universite et superadmin. Insertion cote serveur/service role.
CREATE POLICY "audit_logs_admin_read"
  ON audit_logs FOR SELECT
  USING (
    (current_user_role() = 'admin' AND university_id = current_university_id())
    OR is_platform_admin()
  );

-- ============================================================
-- 16. DONNÉES DE TEST (optionnel — à supprimer en production)
-- ============================================================

-- Université test : UCAD
INSERT INTO universities (id, name, slug, email_domain, plan, max_storage_gb)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Université Cheikh Anta Diop de Dakar',
  'ucad',
  'ucad.edu.sn',
  'free',
  5
) ON CONFLICT DO NOTHING;

-- Université test : ESP
INSERT INTO universities (id, name, slug, email_domain, plan, max_storage_gb)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'École Supérieure Polytechnique',
  'esp',
  'esp.sn',
  'free',
  5
) ON CONFLICT DO NOTHING;

-- Département test : Informatique UCAD
INSERT INTO departments (university_id, name, code, levels)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Département Informatique',
  'INFO',
  ARRAY['L1','L2','L3','M1','M2']
) ON CONFLICT DO NOTHING;

-- ============================================================
-- FIN DU SCHEMA SAMADEPOT v1.0.0
-- ============================================================
