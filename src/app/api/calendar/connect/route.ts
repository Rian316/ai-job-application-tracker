import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

import { auth } from "@/auth";
import { buildCalendarAuthUrl } from "@/lib/calendar-sync";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = randomBytes(24).toString("hex");
  const url = buildCalendarAuthUrl(state);
  if (!url) {
    return NextResponse.json(
      { error: "Google Calendar is not configured." },
      { status: 503 },
    );
  }

  return NextResponse.json({ url, state });
}