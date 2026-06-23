import type { Stat, Submission, SubmissionSpace, SpaceTracking, AcademicClass, Subject, Notification } from "@/types";

export const stats: Stat[] = [
  {
    label: "Depots recus",
    value: "184",
    detail: "Toutes filieres cette semaine",
    trend: "+18 aujourd'hui"
  },
  {
    label: "A traiter",
    value: "31",
    detail: "En attente d'evaluation",
    trend: "9 urgents"
  },
  {
    label: "Taux a l'heure",
    value: "92%",
    detail: "Avant deadline",
    trend: "+4 pts"
  },
  {
    label: "Stockage",
    value: "3.8 Go",
    detail: "Sur 20 Go disponibles",
    trend: "19%"
  }
];

export const spaces: SubmissionSpace[] = [
  {
    id: "pfe-2026",
    title: "Projet de fin d'etudes 2026",
    type: "PFE",
    teacher: "Dr. Marieme Diop",
    department: "Informatique",
    targetLevel: "M2",
    deadline: "15 mai 2026, 23:59",
    status: "urgent",
    formats: ["PDF", "ZIP", "PPTX"],
    maxSizeMb: 150,
    submissions: 42,
    expected: 58
  },
  {
    id: "rapport-stage",
    title: "Rapport de stage licence",
    type: "Rapport",
    teacher: "M. Ibrahima Ndiaye",
    department: "Gestion",
    targetLevel: "L3",
    deadline: "22 mai 2026, 18:00",
    status: "soon",
    formats: ["PDF", "DOCX"],
    maxSizeMb: 50,
    submissions: 86,
    expected: 120
  },
  {
    id: "tp-web",
    title: "TP developpement web",
    type: "TP",
    teacher: "Mme Aissatou Ba",
    department: "Informatique",
    targetLevel: "L2",
    deadline: "31 mai 2026, 20:00",
    status: "open",
    formats: ["ZIP", "PDF"],
    maxSizeMb: 80,
    submissions: 33,
    expected: 64
  }
];

export const submissions: Submission[] = [
  {
    id: "SD-2026-00421",
    spaceId: "mock-space-1",
    student: "Aminata Fall",
    studentEmail: "aminata.fall@ucad.edu.sn",
    studentNumber: "2021-INFO-0421",
    fileName: "memoire_aminata_fall.pdf",
    spaceTitle: "Projet de fin d'etudes 2026",
    spaceType: "PFE",
    submittedAt: "10 mai, 09:42",
    deadline: "15 mai 2026, 23:59",
    status: "received",
    sizeMb: 18.4,
    hash: "a83c91e4f0b9c8d92f1b7c3e5d4a8f06e1b2c9d3f5e7a8b0c1d2e3f4a5b6c7d8",
    isLate: false,
    version: 1
  },
  {
    id: "SD-2026-00420",
    spaceId: "mock-space-2",
    student: "Moussa Sarr",
    studentEmail: "moussa.sarr@ucad.edu.sn",
    studentNumber: "2021-GES-0220",
    fileName: "rapport_stage_moussa.docx",
    spaceTitle: "Rapport de stage licence",
    spaceType: "Rapport",
    submittedAt: "09 mai, 18:12",
    deadline: "22 mai 2026, 18:00",
    status: "graded",
    grade: "16/20",
    sizeMb: 7.9,
    hash: "f1180ad3a52c93bb4e7d6c2a9f0b1e5d3c8a7f2b6e4d9c1a5f3b8e2d7c6a4f1b",
    isLate: false,
    version: 1,
    reviewComment: "Très bon travail, analyse pertinente du marché."
  },
  {
    id: "SD-2026-00419",
    spaceId: "mock-space-1",
    student: "Khadija Sow",
    studentEmail: "khadija.sow@ucad.edu.sn",
    studentNumber: "2022-INFO-0119",
    fileName: "tp_web_khadija.zip",
    spaceTitle: "TP developpement web",
    spaceType: "TP",
    submittedAt: "09 mai, 12:04",
    deadline: "31 mai 2026, 20:00",
    status: "returned",
    sizeMb: 24.1,
    hash: "63fd2b91c016ed47a8b9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3",
    isLate: false,
    version: 1,
    reviewComment: "Corriger la partie CSS responsive et relancer."
  }
];

export const spaceTracking: SpaceTracking[] = [
  {
    spaceId: "tp-web",
    spaceTitle: "TP developpement web",
    spaceType: "TP",
    deadline: "31 mai 2026, 20:00",
    subject: "Développement Web",
    classes: ["L2 Info A", "L2 Info B"],
    totalExpected: 8,
    totalSubmitted: 5,
    totalLate: 1,
    totalPending: 2,
    students: [
      {
        id: "s1", fullName: "Khadija Sow", studentNumber: "2022-INFO-0119",
        submission: { id: "SD-2026-00419", fileName: "tp_web_khadija.zip", submittedAt: "09 mai, 12:04", status: "returned", isLate: false, sizeMb: 24.1 }
      },
      {
        id: "s2", fullName: "Ibrahima Diallo", studentNumber: "2022-INFO-0088",
        submission: { id: "SD-2026-00415", fileName: "tp_ibrahima.zip", submittedAt: "08 mai, 23:51", status: "validated", isLate: true, sizeMb: 18.2 }
      },
      {
        id: "s3", fullName: "Fatou Ndiaye", studentNumber: "2022-INFO-0102",
        submission: { id: "SD-2026-00412", fileName: "tp_fatou_ndiaye.zip", submittedAt: "07 mai, 16:30", status: "graded", grade: "14/20", isLate: false, sizeMb: 31.5 }
      },
      {
        id: "s4", fullName: "Ousmane Ba", studentNumber: "2022-INFO-0145",
        submission: { id: "SD-2026-00410", fileName: "projet_web_oба.zip", submittedAt: "07 mai, 10:22", status: "received", isLate: false, sizeMb: 12.8 }
      },
      {
        id: "s5", fullName: "Mariama Diop", studentNumber: "2022-INFO-0077",
        submission: { id: "SD-2026-00408", fileName: "tp_mariama.zip", submittedAt: "06 mai, 21:18", status: "received", isLate: false, sizeMb: 9.4 }
      },
      { id: "s6", fullName: "Cheikh Mbaye", studentNumber: "2022-INFO-0033" },
      { id: "s7", fullName: "Rokhaya Gueye", studentNumber: "2022-INFO-0156" },
      { id: "s8", fullName: "Pape Sall", studentNumber: "2022-INFO-0201" }
    ]
  },
  {
    spaceId: "pfe-2026",
    spaceTitle: "Projet de fin d'etudes 2026",
    spaceType: "PFE",
    deadline: "15 mai 2026, 23:59",
    subject: "Génie Logiciel",
    classes: ["M2 Info"],
    totalExpected: 12,
    totalSubmitted: 9,
    totalLate: 2,
    totalPending: 4,
    students: [
      {
        id: "s9", fullName: "Aminata Fall", studentNumber: "2021-INFO-0421",
        submission: { id: "SD-2026-00421", fileName: "memoire_aminata_fall.pdf", submittedAt: "10 mai, 09:42", status: "received", isLate: false, sizeMb: 18.4 }
      },
      {
        id: "s10", fullName: "Seydou Niang", studentNumber: "2021-INFO-0302",
        submission: { id: "SD-2026-00418", fileName: "pfe_seydou.pdf", submittedAt: "09 mai, 22:10", status: "read", isLate: false, sizeMb: 22.7 }
      },
      {
        id: "s11", fullName: "Aida Cisse", studentNumber: "2021-INFO-0189",
        submission: { id: "SD-2026-00416", fileName: "memoire_aida_cisse.pdf", submittedAt: "08 mai, 14:05", status: "validated", isLate: false, sizeMb: 19.1 }
      },
      { id: "s12", fullName: "Lamine Traore", studentNumber: "2021-INFO-0267" },
      { id: "s13", fullName: "Ndèye Mbodj", studentNumber: "2021-INFO-0344" },
      { id: "s14", fullName: "Souleymane Fall", studentNumber: "2021-INFO-0088" }
    ]
  }
];

// ─── Données académiques réalistes (UCAD / universités sénégalaises) ────────

export const mockClasses: AcademicClass[] = [
  // ── Informatique / MIAGE ────────────────────────────────────────────────
  { id: "cl-l1-info-a",   name: "L1 Informatique A",      code: "L1-INFO-A",  level: "L1", department: "Informatique", filiere: "Informatique Générale", semester: "S2", groupType: "CM", capacity: 45, academicYear: "2025-2026" },
  { id: "cl-l1-info-b",   name: "L1 Informatique B",      code: "L1-INFO-B",  level: "L1", department: "Informatique", filiere: "Informatique Générale", semester: "S2", groupType: "CM", capacity: 42, academicYear: "2025-2026" },
  { id: "cl-l2-info-a",   name: "L2 Informatique A",      code: "L2-INFO-A",  level: "L2", department: "Informatique", filiere: "Informatique Générale", semester: "S4", groupType: "CM", capacity: 38, academicYear: "2025-2026" },
  { id: "cl-l2-info-b",   name: "L2 Informatique B",      code: "L2-INFO-B",  level: "L2", department: "Informatique", filiere: "Informatique Générale", semester: "S4", groupType: "CM", capacity: 35, academicYear: "2025-2026" },
  { id: "cl-l2-info-tp1", name: "L2 Informatique TP1",    code: "L2-INFO-TP1",level: "L2", department: "Informatique", filiere: "Informatique Générale", semester: "S4", groupType: "TP", capacity: 20, academicYear: "2025-2026" },
  { id: "cl-l2-info-tp2", name: "L2 Informatique TP2",    code: "L2-INFO-TP2",level: "L2", department: "Informatique", filiere: "Informatique Générale", semester: "S4", groupType: "TP", capacity: 18, academicYear: "2025-2026" },
  { id: "cl-l3-info",     name: "L3 Informatique",        code: "L3-INFO",    level: "L3", department: "Informatique", filiere: "Informatique Générale", semester: "S6", groupType: "CM", capacity: 52, academicYear: "2025-2026" },
  { id: "cl-l3-miage",    name: "L3 MIAGE",               code: "L3-MIAGE",   level: "L3", department: "Informatique", filiere: "MIAGE",                 semester: "S6", groupType: "CM", capacity: 30, academicYear: "2025-2026" },
  { id: "cl-m1-gl",       name: "M1 Génie Logiciel",      code: "M1-GL",      level: "M1", department: "Informatique", filiere: "Génie Logiciel",        semester: "S8", groupType: "CM", capacity: 25, academicYear: "2025-2026" },
  { id: "cl-m2-gl",       name: "M2 Génie Logiciel",      code: "M2-GL",      level: "M2", department: "Informatique", filiere: "Génie Logiciel",        semester: "S10", groupType: "CM", capacity: 20, academicYear: "2025-2026" },
  { id: "cl-m1-ia",       name: "M1 Intelligence Artificielle", code: "M1-IA", level: "M1", department: "Informatique", filiere: "IA & Data Science",   semester: "S8", groupType: "CM", capacity: 18, academicYear: "2025-2026" },
  { id: "cl-m2-ia",       name: "M2 Intelligence Artificielle", code: "M2-IA", level: "M2", department: "Informatique", filiere: "IA & Data Science",   semester: "S10", groupType: "CM", capacity: 15, academicYear: "2025-2026" },
  // ── Gestion / Économie ──────────────────────────────────────────────────
  { id: "cl-l1-gest-a",   name: "L1 Gestion A",           code: "L1-GEST-A",  level: "L1", department: "Gestion",       filiere: "Gestion des Entreprises", semester: "S2", groupType: "CM", capacity: 60, academicYear: "2025-2026" },
  { id: "cl-l2-compta",   name: "L2 Comptabilité",        code: "L2-COMPTA",  level: "L2", department: "Gestion",       filiere: "Comptabilité-Finance",    semester: "S4", groupType: "CM", capacity: 44, academicYear: "2025-2026" },
  { id: "cl-l3-finance",  name: "L3 Finance",             code: "L3-FIN",     level: "L3", department: "Gestion",       filiere: "Finance & Banque",        semester: "S6", groupType: "CM", capacity: 38, academicYear: "2025-2026" },
  { id: "cl-m2-audit",    name: "M2 Audit & Contrôle",    code: "M2-AUDIT",   level: "M2", department: "Gestion",       filiere: "Audit & Contrôle de Gestion", semester: "S10", groupType: "CM", capacity: 22, academicYear: "2025-2026" },
  // ── Droit ───────────────────────────────────────────────────────────────
  { id: "cl-l1-droit",    name: "L1 Droit",               code: "L1-DROIT",   level: "L1", department: "Droit",         filiere: "Droit Général",           semester: "S2", groupType: "CM", capacity: 80, academicYear: "2025-2026" },
  { id: "cl-l3-droit-pub",name: "L3 Droit Public",        code: "L3-DPUB",    level: "L3", department: "Droit",         filiere: "Droit Public",            semester: "S6", groupType: "CM", capacity: 35, academicYear: "2025-2026" },
  { id: "cl-m2-droit-aff",name: "M2 Droit des Affaires",  code: "M2-DAFF",    level: "M2", department: "Droit",         filiere: "Droit des Affaires",      semester: "S10", groupType: "CM", capacity: 20, academicYear: "2025-2026" },
  // ── Médecine / Santé ────────────────────────────────────────────────────
  { id: "cl-pcem1",       name: "PCEM1",                  code: "PCEM1",      level: "L1", department: "Médecine",      filiere: "Médecine Générale",       semester: "S2", groupType: "CM", capacity: 200, academicYear: "2025-2026" },
  { id: "cl-med-d3",      name: "Médecine 3ème année",    code: "MED-D3",     level: "L3", department: "Médecine",      filiere: "Médecine Générale",       semester: "S6", groupType: "TD", capacity: 30, academicYear: "2025-2026" },
  // ── DUT / BTS ────────────────────────────────────────────────────────────
  { id: "cl-dut1-info",   name: "DUT1 Informatique",      code: "DUT1-INFO",  level: "DUT1", department: "IUT",         filiere: "Réseaux & Télécoms",      semester: "S2", groupType: "CM", capacity: 32, academicYear: "2025-2026" },
  { id: "cl-dut2-info",   name: "DUT2 Informatique",      code: "DUT2-INFO",  level: "DUT2", department: "IUT",         filiere: "Réseaux & Télécoms",      semester: "S4", groupType: "CM", capacity: 28, academicYear: "2025-2026" },
];

export const mockSubjects: Subject[] = [
  // ── Informatique ─────────────────────────────────────────────────────────
  { id: "sub-algo",     name: "Algorithmique et Structures de Données", code: "INFO201", department: "Informatique", coefficient: 3, credits: 6 },
  { id: "sub-poo",      name: "Programmation Orientée Objet (Java)",    code: "INFO202", department: "Informatique", coefficient: 3, credits: 6 },
  { id: "sub-web",      name: "Développement Web",                       code: "INFO203", department: "Informatique", coefficient: 2, credits: 4 },
  { id: "sub-bdd",      name: "Bases de Données",                        code: "INFO301", department: "Informatique", coefficient: 3, credits: 6 },
  { id: "sub-reseau",   name: "Réseaux Informatiques",                   code: "INFO302", department: "Informatique", coefficient: 2, credits: 4 },
  { id: "sub-sysexp",   name: "Systèmes d'Exploitation",                 code: "INFO303", department: "Informatique", coefficient: 2, credits: 4 },
  { id: "sub-gl",       name: "Génie Logiciel",                          code: "INFO401", department: "Informatique", coefficient: 3, credits: 6 },
  { id: "sub-ia",       name: "Intelligence Artificielle",               code: "INFO501", department: "Informatique", coefficient: 3, credits: 6 },
  { id: "sub-mobile",   name: "Développement Mobile",                    code: "INFO502", department: "Informatique", coefficient: 2, credits: 4 },
  { id: "sub-crypto",   name: "Cryptographie & Sécurité",                code: "INFO503", department: "Informatique", coefficient: 2, credits: 4 },
  // ── Gestion ──────────────────────────────────────────────────────────────
  { id: "sub-compta1",  name: "Comptabilité Générale",                   code: "GEST201", department: "Gestion",       coefficient: 3, credits: 6 },
  { id: "sub-finance",  name: "Finance d'Entreprise",                    code: "GEST301", department: "Gestion",       coefficient: 3, credits: 6 },
  { id: "sub-marketing",name: "Marketing & Communication",               code: "GEST302", department: "Gestion",       coefficient: 2, credits: 4 },
  { id: "sub-audit",    name: "Audit & Contrôle de Gestion",             code: "GEST401", department: "Gestion",       coefficient: 3, credits: 6 },
  { id: "sub-fiscalite",name: "Fiscalité",                               code: "GEST402", department: "Gestion",       coefficient: 2, credits: 4 },
  // ── Droit ─────────────────────────────────────────────────────────────────
  { id: "sub-dc",       name: "Droit Civil",                             code: "DROIT201", department: "Droit",        coefficient: 3, credits: 6 },
  { id: "sub-dp",       name: "Droit Public",                            code: "DROIT202", department: "Droit",        coefficient: 3, credits: 6 },
  { id: "sub-daff",     name: "Droit des Affaires",                      code: "DROIT301", department: "Droit",        coefficient: 2, credits: 4 },
  // ── Communs ───────────────────────────────────────────────────────────────
  { id: "sub-maths",    name: "Mathématiques",                           code: "MATH101",  department: "Sciences",     coefficient: 3, credits: 6 },
  { id: "sub-anglais",  name: "Anglais Technique",                       code: "LANG101",  department: "Langues",      coefficient: 2, credits: 4 },
  { id: "sub-francais", name: "Expression Française",                    code: "LANG102",  department: "Langues",      coefficient: 1, credits: 2 },
];

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "submission_graded",
    title: "Ton travail a été noté",
    body: "Rapport de stage licence — M. Ibrahima Ndiaye t'a attribué 16/20.",
    isRead: false,
    createdAt: "2026-06-15T10:30:00Z",
    link: "/submissions/SD-2026-00418",
    meta: { grade: "16/20", spaceName: "Rapport de stage licence" }
  },
  {
    id: "notif-2",
    type: "submission_returned",
    title: "Dépôt retourné à corriger",
    body: "TP développement web — Mme Aissatou Ba a demandé une correction : \"Corriger la partie CSS responsive et relancer.\"",
    isRead: false,
    createdAt: "2026-06-14T16:45:00Z",
    link: "/submissions/SD-2026-00419",
    meta: { spaceName: "TP développement web" }
  },
  {
    id: "notif-3",
    type: "deadline_reminder",
    title: "Deadline dans 48h",
    body: "Projet de fin d'études 2026 — La deadline est le 15 mai 2026 à 23:59. Tu n'as pas encore déposé.",
    isRead: false,
    createdAt: "2026-06-13T08:00:00Z",
    link: "/spaces/pfe-2026",
    meta: { spaceName: "Projet de fin d'études 2026", deadline: "15 mai 2026, 23:59" }
  },
  {
    id: "notif-4",
    type: "submission_validated",
    title: "Dépôt validé",
    body: "Projet de fin d'études 2026 — Dr. Marieme Diop a validé ton mémoire.",
    isRead: true,
    createdAt: "2026-06-12T11:20:00Z",
    link: "/submissions/SD-2026-00421",
    meta: { spaceName: "Projet de fin d'études 2026" }
  },
  {
    id: "notif-5",
    type: "space_opened",
    title: "Nouvel espace de dépôt ouvert",
    body: "TP développement web — Mme Aissatou Ba a ouvert un espace pour L2 Info A et L2 Info B. Deadline : 31 mai 2026.",
    isRead: true,
    createdAt: "2026-06-10T09:00:00Z",
    link: "/spaces/tp-web",
    meta: { spaceName: "TP développement web", deadline: "31 mai 2026" }
  },
  {
    id: "notif-6",
    type: "submission_received",
    title: "Dépôt bien reçu",
    body: "TP développement web — Ton fichier tp_web_khadija.zip a été enregistré avec succès. ID : SD-2026-00419.",
    isRead: true,
    createdAt: "2026-06-09T12:04:00Z",
    link: "/submissions/SD-2026-00419",
    meta: { spaceName: "TP développement web" }
  },
];
