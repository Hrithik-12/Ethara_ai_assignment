import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/hash";
import { signToken } from "@/lib/jwt";
import { registerSchema } from "@/lib/validations";
import { TOKEN_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first.message, field: first.path[0] },
      { status: 400 }
    );
  }
  const { name, email, password } = parsed.data;

  // duplicate email check
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists", field: "email" },
      { status: 409 }
    );
  }

  const hash = await hashPassword(password);
  const { data: created, error } = await supabase
    .from("users")
    .insert({ name, email, password: hash })
    .select("id, name, email, role, avatar")
    .single();

  if (error || !created) {
    return NextResponse.json(
      { error: "Could not create account" },
      { status: 500 }
    );
  }

  const token = signToken({
    id: created.id,
    email: created.email,
    role: created.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ user: created }, { status: 201 });
}
