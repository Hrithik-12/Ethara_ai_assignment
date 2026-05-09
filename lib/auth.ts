import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import { supabase } from "./supabase";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
  avatar: string | null;
};

export const TOKEN_COOKIE = "token";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, avatar")
    .eq("id", decoded.id)
    .single();

  if (error) return null;
  return data as CurrentUser;
}

// Quick guard helper for route handlers — throws nothing, just returns the
// user (or null) so the caller can choose its own response shape.
export async function requireRole(
  roles: Array<CurrentUser["role"]>
): Promise<{ ok: true; user: CurrentUser } | { ok: false; status: 401 | 403 }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, status: 401 };
  if (!roles.includes(user.role)) return { ok: false, status: 403 };
  return { ok: true, user };
}
