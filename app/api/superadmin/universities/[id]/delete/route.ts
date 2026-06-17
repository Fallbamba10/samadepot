import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "superadmin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ error: "Admin non configuré" }, { status: 500 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // Récupérer tous les utilisateurs de l'université
  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("university_id", id);

  // Supprimer les comptes Supabase Auth (en parallèle, sans bloquer si certains échouent)
  if (users && users.length > 0) {
    await Promise.allSettled(
      users.map((u) => supabaseAdmin.auth.admin.deleteUser(u.id))
    );
  }

  // Supprimer l'université (le CASCADE en base supprime users, spaces, submissions, etc.)
  const { error } = await supabaseAdmin
    .from("universities")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete university error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
