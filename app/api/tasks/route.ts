import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(
      "id, title, description, status, priority, deadline, project_id, assignee_id, creator_id, created_at, project:projects!tasks_project_id_fkey(id, name)"
    )
    .eq("assignee_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tasks: tasks ?? [] });
}
