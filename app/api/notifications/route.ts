import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getNotifications, markNotificationsRead } from "@/lib/data";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const notifications = await getNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return NextResponse.json({ data: notifications, unreadCount });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const ids: string[] = body.ids ?? [];

  await markNotificationsRead(ids);
  return NextResponse.json({ ok: true });
}
