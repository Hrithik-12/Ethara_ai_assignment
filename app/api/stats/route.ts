import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { getAccessibleProjectIds } from "@/lib/projects";
import type { TaskPriority, TaskStatus } from "@/lib/validations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectIds = await getAccessibleProjectIds(user);

  // Tasks across all projects the user can see — used for the charts.
  let tasks: Array<{
    id: string;
    status: TaskStatus;
    priority: TaskPriority;
    deadline: string | null;
    assignee_id: string | null;
  }> = [];
  if (projectIds.length > 0) {
    const { data } = await supabase
      .from("tasks")
      .select("id, status, priority, deadline, assignee_id")
      .in("project_id", projectIds);
    tasks = (data ?? []) as typeof tasks;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  let myOpen = 0;
  let myOverdue = 0;

  for (const t of tasks) {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
    byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
    if (t.assignee_id === user.id && t.status !== "DONE") {
      myOpen += 1;
      if (t.deadline && new Date(t.deadline) < today) {
        myOverdue += 1;
      }
    }
  }

  // Recent tasks assigned to me
  const { data: recentMine } = await supabase
    .from("tasks")
    .select(
      "id, title, status, priority, deadline, project:projects!tasks_project_id_fkey(id, name)"
    )
    .eq("assignee_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Admin-only: recent user signups
  let recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    created_at: string;
  }> = [];
  if (user.role === "ADMIN") {
    const { data } = await supabase
      .from("users")
      .select("id, name, email, role, avatar, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    recentUsers = data ?? [];
  }

  return NextResponse.json({
    totals: {
      projects: projectIds.length,
      tasks: tasks.length,
      myOpen,
      myOverdue,
    },
    byStatus,
    byPriority,
    recentMine: recentMine ?? [],
    recentUsers,
  });
}
