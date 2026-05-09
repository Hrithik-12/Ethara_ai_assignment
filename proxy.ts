// Next.js 16 renamed `middleware` to `proxy`. Same idea: gate routes before
// they hit the page/route handler. We use the JWT cookie to do a cheap auth
// check. Server-side authorization for individual API endpoints happens in
// the route handlers themselves — this is just for navigation UX.

import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "./lib/jwt";

const PUBLIC_ROUTES = ["/login", "/register"];
const ADMIN_PREFIXES = ["/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(decoded ? "/dashboard" : "/login", request.url)
    );
  }

  if (!decoded && !PUBLIC_ROUTES.includes(pathname)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (decoded && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    decoded &&
    ADMIN_PREFIXES.some((p) => pathname.startsWith(p)) &&
    decoded.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
