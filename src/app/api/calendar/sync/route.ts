import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { syncInterviewsToCalendar } from "@/lib/calendar-sync";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await db.integration.findFirst({
    where: { userId: session.user.id, provider: "google_calendar", connected: true },
  });
  if (!integration) {
    return NextResponse.json(
      { error: "Google Calendar is not connected." },
      { status: 400 },
    );
  }

  const result = await syncInterviewsToCalendar(session.user.id);

  return NextResponse.json(result);
}