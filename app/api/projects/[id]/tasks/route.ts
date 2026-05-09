import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { canViewProject } from "@/lib/projects";
import { taskCreateSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: projectId } = await params;

  if (!(await canViewProject(projectId, user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(
      "id, title, description, status, priority, deadline, project_id, assignee_id, creator_id, created_at, assignee:users!tasks_assignee_id_fkey(id, name, avatar)"
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tasks: tasks ?? [] });
}

export async function POST(request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "MEMBER") {
    return NextResponse.json({ error: "Members cannot create tasks" }, { status: 403 });
  }
  const { id: projectId } = await params;

  if (!(await canViewProject(projectId, user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = taskCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { title, description, status, priority, deadline, assignee_id } = parsed.data;
  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      title,
      description: description ?? null,
      status: status ?? "TODO",
      priority: priority ?? "MEDIUM",
      deadline: deadline ?? null,
      assignee_id: assignee_id ?? null,
      project_id: projectId,
      creator_id: user.id,
    })
    .select(
      "id, title, description, status, priority, deadline, project_id, assignee_id, creator_id, created_at, assignee:users!tasks_assignee_id_fkey(id, name, avatar)"
    )
    .single();

  if (error || !task) {
    return NextResponse.json({ error: error?.message ?? "Could not create" }, { status: 500 });
  }
  return NextResponse.json({ task }, { status: 201 });
}
