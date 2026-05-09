import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { comparePassword } from "@/lib/hash";
import { signToken } from "@/lib/jwt";
import { loginSchema } from "@/lib/validations";
import { TOKEN_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const { email, password } = parsed.data;

  const { data: user } = await supabase
    .from("users")
    .select("id, name, email, role, avatar, password")
    .eq("email", email)
    .maybeSingle();

  // Same response for both "no user" and "wrong password" — don't leak which.
  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const ok = await comparePassword(password, user.password);
  if (!ok) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  // strip password before returning
  const { password: _pw, ...safe } = user;
  void _pw;
  return NextResponse.json({ user: safe });
}
