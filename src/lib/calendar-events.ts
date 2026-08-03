import type { CalendarDayEvent } from "@/components/calendar/month-calendar";

export function toCalendarEvents(
  interviews: Array<{
    id: string;
    title: string | null;
    scheduledAt: Date;
    location: string | null;
    meetingUrl: string | null;
    applicationId: string | null;
    application: { id: string; companyName: string } | null;
  }>,
  tasks: Array<{
    id: string;
    title: string;
    dueAt: Date | null;
    status: string;
    applicationId: string | null;
    application: { id: string; companyName: string } | null;
  }>,
): CalendarDayEvent[] {
  const interviewEvents: CalendarDayEvent[] = interviews
    .filter((i) => i.scheduledAt)
    .map((i) => ({
      id: `i-${i.id}`,
      kind: "interview",
      title: i.title
        ? i.title
        : `Interview — ${i.application?.companyName ?? "Application"}`,
      time: i.scheduledAt,
      location: i.location,
      meetingUrl: i.meetingUrl,
      applicationId: i.application?.id ?? i.applicationId,
      companyName: i.application?.companyName ?? null,
    }));

  const taskEvents: CalendarDayEvent[] = tasks
    .filter((t) => t.dueAt)
    .map((t) => ({
      id: `t-${t.id}`,
      kind: "task",
      title: t.title,
      time: t.dueAt as Date,
      applicationId: t.application?.id ?? t.applicationId,
      companyName: t.application?.companyName ?? null,
      done: t.status === "DONE",
    }));

  return [...interviewEvents, ...taskEvents];
}