import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { canManageProject, canViewProject } from "@/lib/projects";
import { projectUpdateSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  if (!(await canViewProject(id, user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      "id, name, description, deadline, created_at, owner_id, owner:users!projects_owner_id_fkey(id, name, email, avatar)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: members } = await supabase
    .from("project_members")
    .select("user_id, joined_at, user:users!project_members_user_id_fkey(id, name, email, role, avatar)")
    .eq("project_id", id)
    .order("joined_at", { ascending: true });

  const { count: tasksTotal } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("project_id", id);

  return NextResponse.json({
    project,
    members: members ?? [],
    tasks_count: tasksTotal ?? 0,
  });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  if (!(await canManageProject(id, user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = projectUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { data: project, error } = await supabase
    .from("projects")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, name, description, deadline, owner_id, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ project });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can delete projects" }, { status: 403 });
  }
  const { id } = await params;

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
