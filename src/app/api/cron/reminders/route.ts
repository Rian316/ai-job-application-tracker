import { NextResponse } from "next/server";
import { addHours } from "date-fns";

import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in24h = addHours(now, 24);
  let created = 0;

  const dueInterviews = await db.interview.findMany({
    where: {
      completed: false,
      scheduledAt: { gte: now, lte: in24h },
    },
    include: {
      user: { select: { id: true, settings: { select: { emailNotifications: true } } } },
      application: { select: { companyName: true } },
    },
  });

  for (const interview of dueInterviews) {
    const existing = await db.reminder.findFirst({
      where: { interviewId: interview.id, sent: false },
    });
    if (existing) continue;

    const company = interview.application?.companyName ?? "your application";
    await createNotification({
      userId: interview.userId,
      type: "INTERVIEW_REMINDER",
      title: `Interview in <24h — ${interview.title ?? company}`,
      body: `${company} · ${interview.scheduledAt.toLocaleString()}`,
      link: `/applications/${interview.applicationId}`,
    });
    await db.reminder.create({
      data: {
        userId: interview.userId,
        interviewId: interview.id,
        title: `Interview reminder: ${interview.title ?? company}`,
        scheduledAt: now,
        channel: "IN_APP",
        sent: false,
      },
    });
    created += 1;
  }

  const dueTasks = await db.task.findMany({
    where: {
      status: { in: ["TODO", "IN_PROGRESS"] },
      dueAt: { gte: now, lte: in24h },
    },
    include: {
      user: { select: { id: true, settings: { select: { emailNotifications: true } } } },
    },
  });

  for (const task of dueTasks) {
    const existing = await db.reminder.findFirst({
      where: { taskId: task.id, sent: false },
    });
    if (existing) continue;

    await createNotification({
      userId: task.userId,
      type: "TASK_REMINDER",
      title: `Task due: ${task.title}`,
      body: `Due ${task.dueAt?.toLocaleString() ?? "soon"}`,
      link: `/tasks?task=${task.id}`,
    });
    await db.reminder.create({
      data: {
        userId: task.userId,
        taskId: task.id,
        title: `Task reminder: ${task.title}`,
        scheduledAt: now,
        channel: "IN_APP",
        sent: false,
      },
    });
    created += 1;
  }

  return NextResponse.json({ ok: true, created });
}