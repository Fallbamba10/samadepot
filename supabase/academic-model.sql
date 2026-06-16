-- ============================================================
-- SAMADEPOT — Modele academique incremental
-- A executer apres supabase/schema.sql dans Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS academic_classes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  name          VARCHAR(120) NOT NULL,
  code          VARCHAR(40) NOT NULL,
  level         VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL DEFAULT '2025-2026',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(university_id, code, academic_year)
);

CREATE TABLE IF NOT EXISTS subjects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  name          VARCHAR(140) NOT NULL,
  code          VARCHAR(40) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(university_id, code)
);

CREATE TABLE IF NOT EXISTS class_students (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  class_id      UUID NOT NULL REFERENCES academic_classes(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

CREATE TABLE IF NOT EXISTS teaching_assignments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  teacher_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id    UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id      UUID NOT NULL REFERENCES academic_classes(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(teacher_id, subject_id, class_id)
);

ALTER TABLE submission_spaces
  ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS submission_space_classes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  space_id      UUID NOT NULL REFERENCES submission_spaces(id) ON DELETE CASCADE,
  class_id      UUID NOT NULL REFERENCES academic_classes(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(space_id, class_id)
);

CREATE INDEX IF NOT EXISTS idx_academic_classes_university ON academic_classes(university_id);
CREATE INDEX IF NOT EXISTS idx_subjects_university ON subjects(university_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON class_students(student_id);
CREATE INDEX IF NOT EXISTS idx_teaching_assignments_teacher ON teaching_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_space_classes_space ON submission_space_classes(space_id);
CREATE INDEX IF NOT EXISTS idx_space_classes_class ON submission_space_classes(class_id);

CREATE OR REPLACE FUNCTION can_admin_university()
RETURNS BOOLEAN AS $$
  SELECT current_user_role() IN ('admin', 'superadmin');
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

ALTER TABLE academic_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_space_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "academic_classes_read_university" ON academic_classes;
CREATE POLICY "academic_classes_read_university"
  ON academic_classes FOR SELECT
  USING (university_id = current_university_id() OR is_platform_admin());

DROP POLICY IF EXISTS "subjects_read_university" ON subjects;
CREATE POLICY "subjects_read_university"
  ON subjects FOR SELECT
  USING (university_id = current_university_id() OR is_platform_admin());

DROP POLICY IF EXISTS "class_students_read_allowed" ON class_students;
CREATE POLICY "class_students_read_allowed"
  ON class_students FOR SELECT
  USING (
    student_id = auth.uid()
    OR university_id = current_university_id()
    OR is_platform_admin()
  );

DROP POLICY IF EXISTS "teaching_assignments_read_allowed" ON teaching_assignments;
CREATE POLICY "teaching_assignments_read_allowed"
  ON teaching_assignments FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR university_id = current_university_id()
    OR is_platform_admin()
  );

DROP POLICY IF EXISTS "submission_space_classes_read_university" ON submission_space_classes;
CREATE POLICY "submission_space_classes_read_university"
  ON submission_space_classes FOR SELECT
  USING (university_id = current_university_id() OR is_platform_admin());

DROP POLICY IF EXISTS "academic_admin_write_classes" ON academic_classes;
CREATE POLICY "academic_admin_write_classes"
  ON academic_classes FOR ALL
  USING (can_admin_university() AND university_id = current_university_id() OR is_platform_admin())
  WITH CHECK (can_admin_university() AND university_id = current_university_id() OR is_platform_admin());

DROP POLICY IF EXISTS "academic_admin_write_subjects" ON subjects;
CREATE POLICY "academic_admin_write_subjects"
  ON subjects FOR ALL
  USING (can_admin_university() AND university_id = current_university_id() OR is_platform_admin())
  WITH CHECK (can_admin_university() AND university_id = current_university_id() OR is_platform_admin());

DROP POLICY IF EXISTS "academic_admin_write_class_students" ON class_students;
CREATE POLICY "academic_admin_write_class_students"
  ON class_students FOR ALL
  USING (can_admin_university() AND university_id = current_university_id() OR is_platform_admin())
  WITH CHECK (can_admin_university() AND university_id = current_university_id() OR is_platform_admin());

DROP POLICY IF EXISTS "academic_admin_write_assignments" ON teaching_assignments;
CREATE POLICY "academic_admin_write_assignments"
  ON teaching_assignments FOR ALL
  USING (can_admin_university() AND university_id = current_university_id() OR is_platform_admin())
  WITH CHECK (can_admin_university() AND university_id = current_university_id() OR is_platform_admin());

DROP POLICY IF EXISTS "teachers_write_space_classes" ON submission_space_classes;
CREATE POLICY "teachers_write_space_classes"
  ON submission_space_classes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM submission_spaces ss
      WHERE ss.id = space_id
      AND (
        ss.teacher_id = auth.uid()
        OR (current_user_role() = 'admin' AND ss.university_id = current_university_id())
        OR is_platform_admin()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM submission_spaces ss
      WHERE ss.id = space_id
      AND (
        ss.teacher_id = auth.uid()
        OR (current_user_role() = 'admin' AND ss.university_id = current_university_id())
        OR is_platform_admin()
      )
    )
  );
