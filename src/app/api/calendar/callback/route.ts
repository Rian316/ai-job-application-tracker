import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";
import { exchangeCalendarCode } from "@/lib/calendar-sync";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(
      new URL("/login?error=Not authenticated", request.url),
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      new URL("/settings?calendar=error", request.url),
    );
  }

  try {
    await exchangeCalendarCode(code, session.user.id);
  } catch (error) {
    console.error("[calendar] OAuth callback failed:", error);
    return NextResponse.redirect(
      new URL("/settings?calendar=error", request.url),
    );
  }

  return NextResponse.redirect(
    new URL("/settings?calendar=connected", request.url),
  );
}