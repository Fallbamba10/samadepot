import { z } from "zod";

export const createSpaceSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(3000).optional(),
  type: z.enum([
    "devoir",
    "examen",
    "tp",
    "rapport_stage",
    "pfe",
    "memoire",
    "expose",
    "autre"
  ]),
  deadline: z.string().datetime(),
  formatsAllowed: z.array(z.string().min(2)).min(1),
  maxSizeMb: z.number().int().min(1).max(500),
  targetLevel: z.string().max(20).optional(),
  subjectId: z.string().uuid().optional(),
  classIds: z.array(z.string().uuid()).optional(),
  allowLate: z.boolean().optional(),
  allowResubmit: z.boolean().optional()
});

export const reviewSubmissionSchema = z.object({
  decision: z.enum(["validate", "grade", "return", "reject"]),
  grade: z.number().min(0).max(20).optional(),
  comment: z.string().max(2000).optional()
}).refine((value) => value.decision !== "grade" || value.grade !== undefined, {
  message: "La note est obligatoire pour noter un depot",
  path: ["grade"]
});

export const uploadRequestSchema = z.object({
  spaceId: z.string().min(1),
  fileName: z.string().min(1).max(255),
  fileSizeMb: z.number().positive(),
  fileMimeType: z.string().min(3)
});

export const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  role: z.enum(["student", "teacher", "admin"]),
  universityId: z.string().uuid(),
  phone: z.string().max(20).optional(),
  studentNumber: z.string().max(30).optional(),
  departmentCode: z.string().max(20).optional(),
  level: z.string().max(20).optional(),
  temporaryPassword: z.string().min(8).max(72).optional()
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  role: z.enum(["student", "teacher", "admin"]).optional(),
  phone: z.string().max(20).optional(),
  studentNumber: z.string().max(30).optional(),
  departmentCode: z.string().max(20).optional(),
  level: z.string().max(20).optional(),
  isActive: z.boolean().optional()
});

export const createAcademicClassSchema = z.object({
  name: z.string().min(2).max(120),
  code: z.string().min(1).max(40),
  level: z.string().min(1).max(20),
  academicYear: z.string().min(4).max(20).optional()
});

export const createSubjectSchema = z.object({
  name: z.string().min(2).max(140),
  code: z.string().min(1).max(40)
});

export const assignStudentClassSchema = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid()
});

export const assignTeacherSchema = z.object({
  teacherId: z.string().uuid(),
  subjectId: z.string().uuid(),
  classId: z.string().uuid()
});
