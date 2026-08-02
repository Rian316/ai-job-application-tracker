import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";

const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute = ["/login", "/register", "/forgot-password"].some(
    (route) => nextUrl.pathname.startsWith(route),
  );

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (!isLoggedIn && !isAuthRoute && nextUrl.pathname !== "/") {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
