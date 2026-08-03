import { startOfMonth } from "date-fns";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { toCalendarEvents } from "@/lib/calendar-events";
import { PageHeader } from "@/components/page-header";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { MonthCalendar } from "@/components/calendar/month-calendar";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const [interviews, tasks] = await Promise.all([
    db.interview.findMany({
      where: { userId },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        location: true,
        meetingUrl: true,
        applicationId: true,
        application: { select: { id: true, companyName: true } },
      },
    }),
    db.task.findMany({
      where: { userId },
      orderBy: { dueAt: "asc" },
      select: {
        id: true,
        title: true,
        dueAt: true,
        status: true,
        applicationId: true,
        application: { select: { id: true, companyName: true } },
      },
    }),
  ]);

  const events = toCalendarEvents(interviews, tasks);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Interviews and task deadlines at a glance."
      >
        <TaskDialog />
      </PageHeader>

      <MonthCalendar events={events} month={startOfMonth(new Date())} />
    </div>
  );
}