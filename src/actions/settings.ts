"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { failZod } from "@/lib/zod";

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  browserNotifications: z.boolean(),
  weeklySummary: z.boolean(),
  weeklySummaryDay: z.string().max(20),
  timezone: z.string().max(64),
  language: z.string().max(8).optional(),
  theme: z.string().max(16).optional(),
});

const goalsSchema = z.object({
  weeklyApplications: z.number().int().min(1).max(100),
  monthlyApplications: z.number().int().min(1).max(500),
  targetRole: z.string().max(120).optional().or(z.literal("")),
  targetCompany: z.string().max(120).optional().or(z.literal("")),
});

export async function updateNotificationSettingsAction(
  input: z.infer<typeof notificationSettingsSchema>,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const parsed = notificationSettingsSchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  await db.settings.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ...parsed.data,
      language: parsed.data.language ?? "en",
      theme: parsed.data.theme ?? "system",
    },
    update: parsed.data,
  });

  revalidatePath("/settings");

  return ok(undefined);
}

export async function updateGoalsAction(
  input: z.infer<typeof goalsSchema>,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const parsed = goalsSchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  await db.userGoal.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  });

  await db.settings.updateMany({
    where: { userId: session.user.id },
    data: {
      weeklyGoal: parsed.data.weeklyApplications,
      monthlyGoal: parsed.data.monthlyApplications,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return ok(undefined);
}