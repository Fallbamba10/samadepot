import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { UserRole } from "@/types";

export type AppUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  universityId: string;
  universityName: string;
};

export async function getCurrentUser(): Promise<AppUser | null> {
  if (!hasSupabaseConfig()) {
    return {
      id: "demo-user",
      email: "aminata.fall@ucad.edu.sn",
      fullName: "Aminata Fall",
      role: "student",
      universityId: "demo-ucad",
      universityName: "Universite Cheikh Anta Diop"
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id,email,full_name,role,university_id,universities(name)")
    .eq("id", user.id)
    .eq("is_active", true)
    .single();

  if (!profile) {
    return null;
  }

  const university = Array.isArray(profile.universities)
    ? profile.universities[0]
    : profile.universities;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    universityId: profile.university_id,
    universityName: university?.name ?? "Universite"
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
