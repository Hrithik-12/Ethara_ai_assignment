import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const adminOnly = url.searchParams.get("admin") === "1";

  // Non-admin callers can list other users (without sensitive fields) so they
  // can assign tasks / add members. Only the explicit admin=1 mode requires
  // ADMIN role and returns extra metadata.
  if (adminOnly && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const select = adminOnly
    ? "id, name, email, role, avatar, created_at"
    : "id, name, email, role, avatar";

  const { data: users, error } = await supabase
    .from("users")
    .select(select)
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: users ?? [] });
}
