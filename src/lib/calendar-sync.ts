import { google } from "googleapis";

import { db } from "@/lib/db";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];
const CALENDAR_ID = "primary";
const EVENT_PREFIX = "[Job Tracker]";

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI ??
      "http://localhost:3000/api/calendar/callback",
  );
}

export function isGoogleCalendarConfigured() {
  return Boolean(
    process.env.GOOGLE_CALENDAR_CLIENT_ID &&
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  );
}

export function buildCalendarAuthUrl(state: string) {
  const oauth = getOAuthClient();
  if (!oauth) return null;

  return oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });
}

export async function exchangeCalendarCode(code: string, userId: string) {
  const oauth = getOAuthClient();
  if (!oauth) throw new Error("Google Calendar is not configured.");

  const { tokens } = await oauth.getToken(code);
  oauth.setCredentials(tokens);

  const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

  const existing = await db.integration.findFirst({
    where: { userId, provider: "google_calendar" },
  });

  if (existing) {
    await db.integration.update({
      where: { id: existing.id },
      data: {
        accessToken: tokens.access_token ?? undefined,
        refreshToken: tokens.refresh_token ?? undefined,
        expiresAt,
        scope: tokens.scope ?? SCOPES.join(" "),
        connected: true,
      },
    });
  } else {
    await db.integration.create({
      data: {
        userId,
        provider: "google_calendar",
        accessToken: tokens.access_token ?? null,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt,
        scope: tokens.scope ?? SCOPES.join(" "),
        connected: true,
      },
    });
  }

  return { ok: true };
}

export async function getCalendarClient(userId: string) {
  const integration = await db.integration.findFirst({
    where: { userId, provider: "google_calendar", connected: true },
  });
  if (!integration?.accessToken) return null;

  const oauth = getOAuthClient();
  if (!oauth) return null;

  oauth.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken ?? undefined,
    expiry_date: integration.expiresAt?.getTime(),
  });

  if (integration.expiresAt && integration.expiresAt.getTime() < Date.now() + 60000) {
    try {
      const { credentials } = await oauth.refreshAccessToken();
      await db.integration.update({
        where: { id: integration.id },
        data: {
          accessToken: credentials.access_token ?? integration.accessToken,
          expiresAt: credentials.expiry_date
            ? new Date(credentials.expiry_date)
            : null,
        },
      });
    } catch (error) {
      console.error("[calendar] Token refresh failed:", error);
      return null;
    }
  }

  return google.calendar({ version: "v3", auth: oauth });
}

export async function syncInterviewsToCalendar(userId: string) {
  const calendar = await getCalendarClient(userId);
  if (!calendar) {
    return { synced: 0, error: "Google Calendar is not connected." };
  }

  const interviews = await db.interview.findMany({
    where: { userId },
    orderBy: { scheduledAt: "desc" },
    include: { application: { select: { companyName: true, position: true } } },
  });

  let synced = 0;

  for (const interview of interviews) {
    if (interview.scheduledAt < new Date()) continue;

    const summary = `${EVENT_PREFIX} ${interview.title ?? "Interview"}`;
    const description = [
      interview.application
        ? `${interview.application.companyName} — ${interview.application.position}`
        : null,
      interview.location ? `Location: ${interview.location}` : null,
      interview.meetingUrl ? `Join: ${interview.meetingUrl}` : null,
      interview.notes ?? null,
    ]
      .filter(Boolean)
      .join("\n");

    const eventBody = {
      summary,
      description,
      start: {
        dateTime: interview.scheduledAt.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(
          interview.scheduledAt.getTime() + interview.duration * 60000,
        ).toISOString(),
        timeZone: "UTC",
      },
      location: interview.location ?? undefined,
      source: { title: "AI Job Application Tracker" },
    };

    try {
      await calendar.events.insert({
        calendarId: CALENDAR_ID,
        requestBody: eventBody,
      });
      synced += 1;
    } catch (error) {
      console.error(`[calendar] Failed to sync interview ${interview.id}:`, error);
    }
  }

  return { synced, error: undefined };
}

export async function disconnectCalendar(userId: string) {
  await db.integration.updateMany({
    where: { userId, provider: "google_calendar" },
    data: { connected: false },
  });
}