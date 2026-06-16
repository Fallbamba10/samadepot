import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSpaceTracking } from "@/lib/data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !["teacher", "admin", "superadmin"].includes(currentUser.role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { id } = await params;
  const tracking = await getSpaceTracking(id);

  if (!tracking) {
    return NextResponse.json({ error: "Espace introuvable" }, { status: 404 });
  }

  const rows = [
    ["Nom", "Numero etudiant", "Fichier", "Date depot", "Statut", "Note", "Retard"],
    ...tracking.students.map((s) => [
      s.fullName,
      s.studentNumber ?? "",
      s.submission?.fileName ?? "Non rendu",
      s.submission?.submittedAt ?? "",
      s.submission?.status ?? "absent",
      s.submission?.grade ?? "",
      s.submission?.isLate ? "Oui" : s.submission ? "Non" : ""
    ])
  ];

  const csv = rows.map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
  ).join("\r\n");

  const filename = `samadepot-${tracking.spaceTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
