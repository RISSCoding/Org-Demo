import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const gates: Record<string, string> = {
  "/admin/finance": "finance:read",
  "/admin/secretariat": "secretariat:manage",
  "/admin/cms": "cms:write",
  "/admin/events": "event:manage",
  "/admin/members": "member:manage",
  "/admin/feedback": "aspirasi:manage",
};

export default auth((req) => {
  const { nextUrl } = req;
  const user = req.auth?.user;
  const path = nextUrl.pathname;

  // Halaman yang butuh login.
  const needsAuth =
    path.startsWith("/admin") ||
    path.startsWith("/dashboard") ||
    path.startsWith("/onboarding");
  if (needsAuth && !user) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  if (path.startsWith("/admin") && user) {
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_EXECUTIVE") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    for (const [prefix, perm] of Object.entries(gates)) {
      if (path.startsWith(prefix) && user.role !== "SUPER_ADMIN" && !user.permissions.includes(perm)) {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
    }
  }

  if (path === "/login" && user) return NextResponse.redirect(new URL("/dashboard", nextUrl));
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|webp)$).*)"],
};
