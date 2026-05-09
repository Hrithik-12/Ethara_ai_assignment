import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { getAccessibleProjectIds } from "@/lib/projects";
import { projectCreateSchema } from "@/lib/validations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ids = await getAccessibleProjectIds(user);
  if (ids.length === 0) {
    return NextResponse.json({ projects: [] });
  }

  const { data: rows, error } = await supabase
    .from("projects")
    .select(
      "id, name, description, deadline, created_at, owner_id, owner:users!projects_owner_id_fkey(id, name, avatar)"
    )
    .in("id", ids)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch member counts and task counts in two cheap queries.
  const [{ data: members }, { data: tasks }] = await Promise.all([
    supabase.from("project_members").select("project_id").in("project_id", ids),
    supabase.from("tasks").select("project_id, status").in("project_id", ids),
  ]);

  const memberCount = new Map<string, number>();
  for (const m of members ?? []) {
    memberCount.set(m.project_id, (memberCount.get(m.project_id) ?? 0) + 1);
  }

  const taskCount = new Map<string, { total: number; done: number }>();
  for (const t of tasks ?? []) {
    const c = taskCount.get(t.project_id) ?? { total: 0, done: 0 };
    c.total += 1;
    if (t.status === "DONE") c.done += 1;
    taskCount.set(t.project_id, c);
  }

  const projects = (rows ?? []).map((p) => ({
    ...p,
    member_count: memberCount.get(p.id) ?? 0,
    tasks: taskCount.get(p.id) ?? { total: 0, done: 0 },
  }));

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "MEMBER") {
    return NextResponse.json({ error: "Members cannot create projects" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = projectCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, description, deadline } = parsed.data;

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name,
      description: description ?? null,
      deadline: deadline ?? null,
      owner_id: user.id,
    })
    .select("id, name, description, deadline, owner_id, created_at")
    .single();

  if (error || !project) {
    return NextResponse.json({ error: error?.message ?? "Could not create" }, { status: 500 });
  }

  // Auto-add creator as a member so they show up in their own list.
  await supabase
    .from("project_members")
    .insert({ project_id: project.id, user_id: user.id });

  return NextResponse.json({ project }, { status: 201 });
}
