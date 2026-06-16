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

  return NextResponse.json({ data: tracking });
}
