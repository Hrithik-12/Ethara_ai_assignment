import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { canManageProject, canViewProject } from "@/lib/projects";
import { taskUpdateSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ id: string }> };

async function fetchTask(id: string) {
  const { data } = await supabase
    .from("tasks")
    .select("id, project_id, assignee_id")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function PATCH(request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const task = await fetchTask(id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Must at least be a member of the project (or admin) to touch the task.
  if (!(await canViewProject(task.project_id, user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = taskUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // MEMBER can only flip status, and only on tasks assigned to them.
  if (user.role === "MEMBER") {
    const allowed = Object.keys(parsed.data);
    if (allowed.length !== 1 || allowed[0] !== "status") {
      return NextResponse.json(
        { error: "Members can only update task status" },
        { status: 403 }
      );
    }
    if (task.assignee_id !== user.id) {
      return NextResponse.json(
        { error: "You can only update tasks assigned to you" },
        { status: 403 }
      );
    }
  }

  const { data: updated, error } = await supabase
    .from("tasks")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(
      "id, title, description, status, priority, deadline, project_id, assignee_id, creator_id, updated_at, assignee:users!tasks_assignee_id_fkey(id, name, avatar)"
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: updated });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const task = await fetchTask(id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.role === "MEMBER") {
    return NextResponse.json({ error: "Members cannot delete tasks" }, { status: 403 });
  }
  // MANAGERs need to own the project to delete its tasks; ADMIN can always.
  if (user.role !== "ADMIN" && !(await canManageProject(task.project_id, user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
