import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/env";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminConfig
} from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { spaces, stats, submissions, spaceTracking, mockClasses, mockSubjects, mockNotifications } from "@/lib/mock-data";
import type {
  AcademicOptions,
  AdminOverview,
  AdminUser,
  Notification,
  Stat,
  Submission,
  SubmissionSpace,
  SpaceTracking
} from "@/types";

export async function getDashboardStats(): Promise<Stat[]> {
  if (!hasSupabaseConfig()) {
    return stats;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("v_university_stats")
    .select("*")
    .limit(1)
    .single();

  if (error || !data) {
    return stats;
  }

  return [
    {
      label: "Depots recus",
      value: String(data.total_submissions ?? 0),
      detail: "Tous les espaces de l'universite",
      trend: `${data.submissions_today ?? 0} aujourd'hui`
    },
    {
      label: "A traiter",
      value: String(data.pending_submissions ?? 0),
      detail: "En attente d'evaluation"
    },
    {
      label: "Utilisateurs",
      value: String(
        Number(data.total_students ?? 0) + Number(data.total_teachers ?? 0)
      ),
      detail: "Etudiants et professeurs actifs"
    },
    {
      label: "Stockage",
      value: `${data.used_storage_mb ?? 0} Mo`,
      detail: `Sur ${data.max_storage_gb ?? 0} Go disponibles`
    }
  ];
}

export async function getSpaces(): Promise<SubmissionSpace[]> {
  if (!hasSupabaseConfig()) {
    return spaces;
  }

  const currentUser = await getCurrentUser();
  if (currentUser && hasSupabaseAdminConfig()) {
    const supabaseAdmin = createSupabaseAdminClient();
    let query = supabaseAdmin
      .from("submission_spaces")
      .select(
        "id,university_id,teacher_id,department_id,subject_id,title,type,target_level,deadline,formats_allowed,max_size_mb,is_active"
      )
      .eq("is_active", true)
      .order("deadline", { ascending: true });

    if (currentUser.role === "teacher") {
      query = query.eq("teacher_id", currentUser.id);
    } else if (currentUser.role !== "superadmin") {
      query = query.eq("university_id", currentUser.universityId);
    }

    const { data, error } = await query;

    if (!error && data) {
      const visibleData = await filterSpacesForUser(data, currentUser, supabaseAdmin);
      const teacherIds = [...new Set(data.map((space) => space.teacher_id))];
      const departmentIds = [
        ...new Set(data.map((space) => space.department_id).filter(Boolean))
      ];
      const subjectIds = [
        ...new Set(visibleData.map((space) => space.subject_id).filter(Boolean))
      ];
      const spaceIds = visibleData.map((space) => space.id);
      const [teachersResult, departmentsResult, subjectsResult, countsResult, classLinksResult] = await Promise.all([
        teacherIds.length > 0
          ? supabaseAdmin
              .from("users")
              .select("id,full_name")
              .in("id", teacherIds)
          : Promise.resolve({ data: [] }),
        departmentIds.length > 0
          ? supabaseAdmin
              .from("departments")
              .select("id,name")
              .in("id", departmentIds)
          : Promise.resolve({ data: [] }),
        subjectIds.length > 0
          ? supabaseAdmin
              .from("subjects")
              .select("id,name")
              .in("id", subjectIds)
          : Promise.resolve({ data: [] }),
        spaceIds.length > 0
          ? supabaseAdmin
              .from("submissions")
              .select("space_id")
              .in("space_id", spaceIds)
          : Promise.resolve({ data: [] }),
        spaceIds.length > 0
          ? supabaseAdmin
              .from("submission_space_classes")
              .select("space_id,academic_classes(name,code)")
              .in("space_id", spaceIds)
          : Promise.resolve({ data: [] })
      ]);

      const teacherNames = new Map(
        (teachersResult.data ?? []).map((teacher: any) => [
          teacher.id,
          teacher.full_name
        ])
      );
      const departmentNames = new Map(
        (departmentsResult.data ?? []).map((department: any) => [
          department.id,
          department.name
        ])
      );
      const subjectNames = new Map(
        (subjectsResult.data ?? []).map((subject: any) => [
          subject.id,
          subject.name
        ])
      );
      const submissionCounts = new Map<string, number>();
      (countsResult.data ?? []).forEach((submission: any) => {
        submissionCounts.set(
          submission.space_id,
          (submissionCounts.get(submission.space_id) ?? 0) + 1
        );
      });
      const classNames = new Map<string, string[]>();
      (classLinksResult.data ?? []).forEach((link: any) => {
        const classes = Array.isArray(link.academic_classes)
          ? link.academic_classes
          : [link.academic_classes].filter(Boolean);
        const labels = classes.map((item: any) => item.name ?? item.code);
        classNames.set(link.space_id, [
          ...(classNames.get(link.space_id) ?? []),
          ...labels
        ]);
      });

      return visibleData.map((space) => ({
        id: space.id,
        title: space.title,
        type: space.type,
        teacher: teacherNames.get(space.teacher_id) ?? "Professeur",
        department: space.department_id
          ? departmentNames.get(space.department_id) ?? "Departement"
          : "Tous departements",
        targetLevel: space.target_level ?? "Tous",
        subject: space.subject_id ? subjectNames.get(space.subject_id) : undefined,
        classes: classNames.get(space.id) ?? [],
        deadline: formatDate(space.deadline) ?? "",
        status: getDeadlineStatus(space.deadline),
        formats: space.formats_allowed ?? [],
        maxSizeMb: space.max_size_mb,
        submissions: submissionCounts.get(space.id) ?? 0,
        expected: 100
      }));
    }
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("v_active_spaces")
    .select("*")
    .order("deadline", { ascending: true });

  if (error || !data) {
    return spaces;
  }

  return data.map((space) => ({
    id: space.id,
    title: space.title,
    type: space.type,
    teacher: space.teacher_name ?? "Professeur",
    department: space.department_name ?? "Tous departements",
    targetLevel: space.target_level ?? "Tous",
    deadline: new Date(space.deadline).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short"
    }),
    status: space.deadline_status,
    formats: space.formats_allowed ?? [],
    maxSizeMb: space.max_size_mb,
    submissions: Number(space.submission_count ?? 0),
    expected: 100
  }));
}

export async function getAcademicOptions(): Promise<AcademicOptions> {
  if (!hasSupabaseConfig() || !hasSupabaseAdminConfig()) {
    return { classes: mockClasses, subjects: mockSubjects, students: [], teachers: [] };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser || !["teacher", "admin", "superadmin"].includes(currentUser.role)) {
    return { classes: [], subjects: [], students: [], teachers: [] };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const universityId = currentUser.universityId;
  const [classesResult, subjectsResult, usersResult] = await Promise.all([
    supabaseAdmin
      .from("academic_classes")
      .select("id,name,code,level,academic_year")
      .eq("university_id", universityId)
      .eq("is_active", true)
      .order("level", { ascending: true })
      .order("name", { ascending: true }),
    supabaseAdmin
      .from("subjects")
      .select("id,name,code")
      .eq("university_id", universityId)
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabaseAdmin
      .from("users")
      .select("id,email,full_name,role,university_id,phone,student_number,department_code,level,is_active,created_at")
      .eq("university_id", universityId)
      .in("role", ["student", "teacher"])
      .order("full_name", { ascending: true })
  ]);

  return {
    classes: (classesResult.data ?? []).map((item: any) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      level: item.level,
      department: item.department ?? "",
      filiere: item.filiere ?? item.level,
      semester: item.semester ?? undefined,
      groupType: item.group_type ?? undefined,
      capacity: item.capacity ?? undefined,
      academicYear: item.academic_year
    })),
    subjects: (subjectsResult.data ?? []).map((item: any) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      department: item.department ?? undefined,
      coefficient: item.coefficient ?? undefined,
      credits: item.credits ?? undefined,
    })),
    students: (usersResult.data ?? [])
      .filter((item: any) => item.role === "student")
      .map(mapAdminUserWithoutUniversity),
    teachers: (usersResult.data ?? [])
      .filter((item: any) => item.role === "teacher")
      .map(mapAdminUserWithoutUniversity)
  };
}

export async function getSubmissions(): Promise<Submission[]> {
  if (!hasSupabaseConfig()) {
    return submissions;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("v_submissions_full")
    .select("*")
    .order("submitted_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    return submissions;
  }

  return data.map(mapSubmission);
}

export async function getSubmissionById(id: string): Promise<Submission> {
  if (!hasSupabaseConfig()) {
    const submission = submissions.find((item) => item.id === id);
    if (!submission) {
      notFound();
    }

    return submission;
  }

  const user = await getCurrentUser();
  if (!user) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("v_submissions_full")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  return mapSubmission(data);
}

export async function getAdminOverview(): Promise<AdminOverview> {
  if (!hasSupabaseConfig()) {
    return {
      totalUsers: 1284,
      totalStudents: 1120,
      totalTeachers: 164,
      totalSpaces: 0,
      usedStorageMb: 3800,
      maxStorageGb: 20,
      universityName: "UCAD Dakar"
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("v_university_stats")
    .select("*")
    .limit(1)
    .single();

  if (error || !data) {
    return {
      totalUsers: 0,
      totalStudents: 0,
      totalTeachers: 0,
      totalSpaces: 0,
      usedStorageMb: 0,
      maxStorageGb: 0,
      universityName: "Universite"
    };
  }

  const totalStudents = Number(data.total_students ?? 0);
  const totalTeachers = Number(data.total_teachers ?? 0);

  return {
    totalUsers: totalStudents + totalTeachers,
    totalStudents,
    totalTeachers,
    totalSpaces: Number(data.total_spaces ?? 0),
    usedStorageMb: Number(data.used_storage_mb ?? 0),
    maxStorageGb: Number(data.max_storage_gb ?? 0),
    universityName: data.name ?? "Universite"
  };
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (!hasSupabaseConfig()) {
    return [
      {
        id: "demo-user",
        email: "aminata.fall@ucad.edu.sn",
        fullName: "Aminata Fall",
        role: "student",
        universityId: "demo-ucad",
        universityName: "UCAD Dakar",
        departmentCode: "INFO",
        level: "L3",
        isActive: true,
        createdAt: "10 mai 2026"
      }
    ];
  }

  const currentUser = await getCurrentUser();
  if (!currentUser || !["admin", "superadmin"].includes(currentUser.role)) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("users")
    .select(
      "id,email,full_name,role,university_id,phone,student_number,department_code,level,is_active,created_at,universities(name)"
    )
    .order("created_at", { ascending: false })
    .limit(80);

  if (currentUser.role === "admin") {
    query = query.eq("university_id", currentUser.universityId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map((user) => {
    const university = Array.isArray(user.universities)
      ? user.universities[0]
      : user.universities;

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      universityId: user.university_id,
      universityName: university?.name ?? "Universite",
      phone: user.phone ?? undefined,
      studentNumber: user.student_number ?? undefined,
      departmentCode: user.department_code ?? undefined,
      level: user.level ?? undefined,
      isActive: Boolean(user.is_active),
      createdAt: formatDate(user.created_at) ?? ""
    };
  });
}

async function filterSpacesForUser(
  spacesData: any[],
  currentUser: { id: string; role: string; universityId: string },
  supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>
) {
  if (currentUser.role !== "student") {
    return spacesData;
  }

  const { data: memberships, error: membershipsError } = await supabaseAdmin
    .from("class_students")
    .select("class_id")
    .eq("student_id", currentUser.id);

  if (membershipsError) {
    return spacesData;
  }

  const classIds = (memberships ?? []).map((item: any) => item.class_id);
  if (classIds.length === 0) {
    return [];
  }

  const { data: links, error: linksError } = await supabaseAdmin
    .from("submission_space_classes")
    .select("space_id,class_id")
    .in(
      "space_id",
      spacesData.map((space) => space.id)
    );

  if (linksError) {
    return spacesData;
  }

  const linkedSpaceIds = new Set((links ?? []).map((item: any) => item.space_id));
  const visibleSpaceIds = new Set(
    (links ?? [])
      .filter((item: any) => classIds.includes(item.class_id))
      .map((item: any) => item.space_id)
  );

  return spacesData.filter(
    (space) => visibleSpaceIds.has(space.id) || !linkedSpaceIds.has(space.id)
  );
}

function mapAdminUserWithoutUniversity(user: any): AdminUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    universityId: user.university_id,
    universityName: "Universite",
    phone: user.phone ?? undefined,
    studentNumber: user.student_number ?? undefined,
    departmentCode: user.department_code ?? undefined,
    level: user.level ?? undefined,
    isActive: Boolean(user.is_active),
    createdAt: formatDate(user.created_at) ?? ""
  };
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  return new Date(value).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function getDeadlineStatus(value: string) {
  const now = Date.now();
  const deadline = new Date(value).getTime();
  const hoursLeft = (deadline - now) / 1000 / 60 / 60;

  if (hoursLeft < 0) {
    return "expired";
  }

  if (hoursLeft <= 48) {
    return "urgent";
  }

  if (hoursLeft <= 168) {
    return "soon";
  }

  return "open";
}

function mapSubmission(submission: any): Submission {
  return {
    id: submission.id,
    student: submission.student_name ?? "Etudiant",
    studentEmail: submission.student_email ?? undefined,
    studentNumber: submission.student_number ?? undefined,
    fileName: submission.file_name,
    spaceTitle: submission.space_title,
    spaceType: submission.space_type ?? undefined,
    submittedAt: formatDate(submission.submitted_at) ?? "",
    deadline: formatDate(submission.deadline),
    status: submission.status,
    grade: submission.grade ? `${submission.grade}/${submission.grade_max}` : undefined,
    sizeMb: Number(submission.file_size_mb),
    hash: submission.file_hash,
    comment: submission.student_comment ?? undefined,
    reviewComment: submission.review_comment ?? undefined,
    reviewedAt: formatDate(submission.reviewed_at),
    version: Number(submission.version ?? 1),
    isLate: Boolean(submission.is_late)
  };
}

export async function getSpaceTracking(spaceId: string): Promise<SpaceTracking | null> {
  if (!hasSupabaseConfig() || !hasSupabaseAdminConfig()) {
    return spaceTracking.find((t) => t.spaceId === spaceId) ?? null;
  }

  const currentUser = await getCurrentUser();
  if (!currentUser || !["teacher", "admin", "superadmin"].includes(currentUser.role)) {
    return null;
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: space, error: spaceError } = await supabaseAdmin
    .from("submission_spaces")
    .select("id,title,type,deadline,subject_id,teacher_id")
    .eq("id", spaceId)
    .single();

  if (spaceError || !space) return null;

  if (currentUser.role === "teacher" && space.teacher_id !== currentUser.id) return null;

  const [classLinksResult, submissionsResult] = await Promise.all([
    supabaseAdmin
      .from("submission_space_classes")
      .select("class_id,academic_classes(id,name,code)")
      .eq("space_id", spaceId),
    supabaseAdmin
      .from("submissions")
      .select("id,student_id,file_name,file_size_mb,submitted_at,status,grade,grade_max,is_late")
      .eq("space_id", spaceId)
      .order("submitted_at", { ascending: false })
  ]);

  const classIds = (classLinksResult.data ?? []).map((l: any) => l.class_id);
  const classNames = (classLinksResult.data ?? []).map((l: any) => {
    const c = Array.isArray(l.academic_classes) ? l.academic_classes[0] : l.academic_classes;
    return c?.name ?? c?.code ?? "Classe";
  });

  let allStudents: any[] = [];
  if (classIds.length > 0) {
    const { data: memberships } = await supabaseAdmin
      .from("class_students")
      .select("student_id,users(id,full_name,student_number)")
      .in("class_id", classIds);
    const seen = new Set<string>();
    for (const m of memberships ?? []) {
      const u = Array.isArray(m.users) ? m.users[0] : m.users;
      if (u && !seen.has(u.id)) {
        seen.add(u.id);
        allStudents.push(u);
      }
    }
  }

  const subMap = new Map<string, any>();
  for (const s of submissionsResult.data ?? []) {
    if (!subMap.has(s.student_id)) subMap.set(s.student_id, s);
  }

  const subjectName = space.subject_id
    ? (await supabaseAdmin.from("subjects").select("name").eq("id", space.subject_id).single()).data?.name
    : undefined;

  const totalSubmitted = subMap.size;
  const totalLate = [...subMap.values()].filter((s) => s.is_late).length;
  const totalPending = allStudents.filter((s) => !subMap.has(s.id)).length;

  return {
    spaceId: space.id,
    spaceTitle: space.title,
    spaceType: space.type,
    deadline: formatDate(space.deadline) ?? "",
    subject: subjectName ?? undefined,
    classes: classNames,
    totalExpected: allStudents.length || totalSubmitted,
    totalSubmitted,
    totalLate,
    totalPending,
    students: allStudents.map((student) => {
      const sub = subMap.get(student.id);
      return {
        id: student.id,
        fullName: student.full_name,
        studentNumber: student.student_number ?? undefined,
        submission: sub ? {
          id: sub.id,
          fileName: sub.file_name,
          submittedAt: formatDate(sub.submitted_at) ?? "",
          status: sub.status,
          grade: sub.grade ? `${sub.grade}/${sub.grade_max}` : undefined,
          isLate: Boolean(sub.is_late),
          sizeMb: Number(sub.file_size_mb)
        } : undefined
      };
    })
  };
}

export async function getNotifications(): Promise<Notification[]> {
  if (!hasSupabaseConfig()) {
    return mockNotifications;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return mockNotifications;

  return data.map((n: any) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    isRead: Boolean(n.is_read),
    createdAt: n.created_at,
    link: n.link ?? undefined,
    meta: n.meta ?? undefined,
  }));
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  if (!hasSupabaseConfig()) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("notifications").update({ is_read: true }).in("id", ids);
}
