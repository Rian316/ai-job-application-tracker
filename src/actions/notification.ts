"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ok, fail, type ActionResult } from "@/lib/action-result";

export async function markNotificationReadAction(
  id: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await db.notification.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!owned) return fail("Notification not found.");

  await db.notification.update({ where: { id }, data: { status: "READ" } });

  revalidatePath("/notifications");

  return ok(undefined);
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  await db.notification.updateMany({
    where: { userId: session.user.id, status: "UNREAD" },
    data: { status: "READ" },
  });

  revalidatePath("/notifications");

  return ok(undefined);
}

export async function deleteNotificationAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await db.notification.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!owned) return fail("Notification not found.");

  await db.notification.delete({ where: { id } });

  revalidatePath("/notifications");

  return ok(undefined);
}