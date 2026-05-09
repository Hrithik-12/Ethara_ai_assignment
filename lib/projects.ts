// Tiny helpers for the project access checks we keep repeating.
import { supabase } from "./supabase";
import type { CurrentUser } from "./auth";

export async function getAccessibleProjectIds(user: CurrentUser): Promise<string[]> {
  if (user.role === "ADMIN") {
    const { data } = await supabase.from("projects").select("id");
    return (data ?? []).map((p) => p.id as string);
  }
  const { data } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", user.id);
  return (data ?? []).map((m) => m.project_id as string);
}

export async function isMember(projectId: string, userId: string) {
  const { data } = await supabase
    .from("project_members")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

export async function getProjectOwner(projectId: string): Promise<string | null> {
  const { data } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", projectId)
    .maybeSingle();
  return (data?.owner_id as string) ?? null;
}

export async function canManageProject(projectId: string, user: CurrentUser) {
  if (user.role === "ADMIN") return true;
  const owner = await getProjectOwner(projectId);
  return owner === user.id;
}

export async function canViewProject(projectId: string, user: CurrentUser) {
  if (user.role === "ADMIN") return true;
  return isMember(projectId, user.id);
}
