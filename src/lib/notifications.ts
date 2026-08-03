import { db } from "@/lib/db";

type CreateNotificationInput = {
  userId: string;
  type: "INTERVIEW_REMINDER" | "APPLICATION_REMINDER" | "FOLLOW_UP_REMINDER" | "WEEKLY_SUMMARY" | "SYSTEM" | "TASK_REMINDER";
  title: string;
  body?: string;
  link?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  const settings = await db.settings
    .findUnique({ where: { userId: input.userId } })
    .catch(() => null);

  if (input.type === "TASK_REMINDER" || input.type === "INTERVIEW_REMINDER") {
    if (settings && settings.emailNotifications === false) return;
  }

  return db.notification.create({
    data: {
      userId: input.userId,
      type: input.type as never,
      channel: "IN_APP",
      title: input.title,
      body: input.body,
      link: input.link,
    },
  });
}

export async function createTaskNotification(task: {
  userId: string;
  id: string;
  title: string;
  dueAt: Date | null;
}) {
  return createNotification({
    userId: task.userId,
    type: "TASK_REMINDER",
    title: task.dueAt ? `Task due: ${task.title}` : task.title,
    body: task.dueAt
      ? `Due ${task.dueAt.toLocaleDateString()} — keep your job search on track.`
      : "Follow up and move this forward.",
    link: `/tasks?task=${task.id}`,
  });
}