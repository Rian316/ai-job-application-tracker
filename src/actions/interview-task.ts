"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { failZod } from "@/lib/zod";
import {
  interviewSchema,
  taskSchema,
  type InterviewInput,
  type TaskInput,
} from "@/validators/application";

export async function createInterviewAction(
  input: InterviewInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const parsed = interviewSchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  const owned = await db.application.findFirst({
    where: { id: parsed.data.applicationId, userId: session.user.id },
    select: { id: true },
  });
  if (!owned) return fail("Application not found.");

  const interview = await db.interview.create({
    data: {
      userId: session.user.id,
      applicationId: parsed.data.applicationId,
      title: parsed.data.title || null,
      type: parsed.data.type as never,
      scheduledAt: new Date(parsed.data.scheduledAt),
      duration: Number(parsed.data.duration),
      location: parsed.data.location || null,
      meetingUrl: parsed.data.meetingUrl || null,
      notes: parsed.data.notes || null,
    },
    select: { id: true },
  });

  await db.activityLog.create({
    data: {
      userId: session.user.id,
      applicationId: parsed.data.applicationId,
      type: "INTERVIEW_SCHEDULED",
      message: `Scheduled interview for ${new Date(parsed.data.scheduledAt).toLocaleDateString()}`,
    },
  });

  revalidatePath("/calendar");
  revalidatePath(`/applications/${parsed.data.applicationId}`);
  revalidatePath("/dashboard");

  return ok({ id: interview.id });
}

export async function completeInterviewAction(
  id: string,
  completed: boolean,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await db.interview.findFirst({ where: { id, userId: session.user.id }, select: { id: true } });
  if (!owned) return fail("Interview not found.");

  await db.interview.update({ where: { id }, data: { completed } });

  revalidatePath("/calendar");
  revalidatePath("/dashboard");

  return ok(undefined);
}

export async function deleteInterviewAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await db.interview.findFirst({ where: { id, userId: session.user.id }, select: { applicationId: true } });
  if (!owned) return fail("Interview not found.");

  await db.interview.delete({ where: { id } });

  revalidatePath("/calendar");
  revalidatePath(`/applications/${owned.applicationId}`);
  revalidatePath("/dashboard");

  return ok(undefined);
}

export async function createTaskAction(
  input: TaskInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  if (parsed.data.applicationId) {
    const owned = await db.application.findFirst({
      where: { id: parsed.data.applicationId, userId: session.user.id },
      select: { id: true },
    });
    if (!owned) return fail("Application not found.");
  }

  const task = await db.task.create({
    data: {
      userId: session.user.id,
      applicationId: parsed.data.applicationId || null,
      title: parsed.data.title,
      description: parsed.data.description || null,
      type: parsed.data.type as never,
      priority: parsed.data.priority as never,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
      recurring: parsed.data.recurring,
      recurringInterval: parsed.data.recurringInterval ? Number(parsed.data.recurringInterval) : null,
    },
    select: { id: true },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (parsed.data.applicationId) {
    revalidatePath(`/applications/${parsed.data.applicationId}`);
  }

  return ok({ id: task.id });
}

export async function updateTaskStatusAction(
  id: string,
  status: "TODO" | "IN_PROGRESS" | "DONE" | "OVERDUE",
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await db.task.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, applicationId: true },
  });
  if (!owned) return fail("Task not found.");

  await db.task.update({
    where: { id },
    data: { status, completedAt: status === "DONE" ? new Date() : null },
  });

  if (status === "DONE") {
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        applicationId: owned.applicationId,
        type: "TASK_COMPLETED",
        message: "Completed a task",
      },
    });
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (owned.applicationId) {
    revalidatePath(`/applications/${owned.applicationId}`);
  }

  return ok(undefined);
}

export async function deleteTaskAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await db.task.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, applicationId: true },
  });
  if (!owned) return fail("Task not found.");

  await db.task.delete({ where: { id } });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (owned.applicationId) {
    revalidatePath(`/applications/${owned.applicationId}`);
  }

  return ok(undefined);
}
