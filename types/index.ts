export type UserRole = "student" | "teacher" | "admin" | "superadmin";

export type SubmissionStatus =
  | "received"
  | "read"
  | "validated"
  | "graded"
  | "returned"
  | "rejected"
  | "late";

export type SpaceStatus = "open" | "soon" | "urgent" | "expired";

export type SubmissionSpace = {
  id: string;
  title: string;
  type: string;
  teacher: string;
  department: string;
  targetLevel: string;
  subject?: string;
  classes?: string[];
  deadline: string;
  status: SpaceStatus;
  formats: string[];
  maxSizeMb: number;
  submissions: number;
  expected: number;
};

export type Submission = {
  id: string;
  student: string;
  studentEmail?: string;
  studentNumber?: string;
  fileName: string;
  spaceTitle: string;
  spaceType?: string;
  submittedAt: string;
  deadline?: string;
  status: SubmissionStatus;
  grade?: string;
  sizeMb: number;
  hash: string;
  comment?: string;
  reviewComment?: string;
  reviewedAt?: string;
  version?: number;
  isLate?: boolean;
};

export type Stat = {
  label: string;
  value: string;
  detail: string;
  trend?: string;
};

export type AdminOverview = {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalSpaces: number;
  usedStorageMb: number;
  maxStorageGb: number;
  universityName: string;
};

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  universityId: string;
  universityName: string;
  phone?: string;
  studentNumber?: string;
  departmentCode?: string;
  level?: string;
  isActive: boolean;
  createdAt: string;
};

export type AcademicClass = {
  id: string;
  name: string;
  code: string;
  level: string;       // L1, L2, L3, M1, M2, DUT1, DUT2, BTS1, BTS2, Doctorat
  department: string;  // Informatique, Gestion, Droit, Médecine...
  filiere: string;     // MIAGE, Génie Logiciel, Finance, Comptabilité...
  semester?: string;   // S1, S2, Rattrapage
  groupType?: string;  // CM, TP, TD
  capacity?: number;
  academicYear: string;
};

export type Subject = {
  id: string;
  name: string;
  code: string;
  department?: string;
  coefficient?: number;
  credits?: number;    // ECTS
};

export type AcademicOptions = {
  classes: AcademicClass[];
  subjects: Subject[];
  students: AdminUser[];
  teachers: AdminUser[];
};

export type NotificationType =
  | "submission_graded"
  | "submission_returned"
  | "submission_validated"
  | "submission_rejected"
  | "submission_received"
  | "submission_late"
  | "space_opened"
  | "deadline_reminder";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  meta?: {
    grade?: string;
    spaceName?: string;
    studentName?: string;
    deadline?: string;
  };
};

export type SpaceStudent = {
  id: string;
  fullName: string;
  studentNumber?: string;
  submission?: {
    id: string;
    fileName: string;
    submittedAt: string;
    status: SubmissionStatus;
    grade?: string;
    isLate: boolean;
    sizeMb: number;
  };
};

export type AdminSpaceRow = {
  id: string;
  title: string;
  type: string;
  teacherName: string;
  classes: string[];
  deadline: string;
  status: SpaceStatus;
  totalSubmitted: number;
  totalExpected: number;
};

export type AdminClassRow = {
  id: string;
  name: string;
  code: string;
  level: string;
  totalStudents: number;
  totalSubmissions: number;
  participationPct: number;
};

export type AdminDashboard = {
  activeSpaces: AdminSpaceRow[];
  classStats: AdminClassRow[];
  teachersWithoutSpace: { id: string; fullName: string; email: string }[];
  recentSubmissions: { id: string; studentName: string; spaceTitle: string; submittedAt: string; isLate: boolean }[];
};

export type SpaceTracking = {
  spaceId: string;
  spaceTitle: string;
  spaceType: string;
  deadline: string;
  subject?: string;
  classes: string[];
  totalExpected: number;
  totalSubmitted: number;
  totalLate: number;
  totalPending: number;
  students: SpaceStudent[];
};
