"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { failZod } from "@/lib/zod";
import {
  applicationSchema,
  applicationStatusUpdateSchema,
  type ApplicationInput,
} from "@/validators/application";
import type { ApplicationStatus } from "@/lib/status";

type AppSelect = {
  id: string;
  companyName: string;
  position: string;
  status: string;
};

async function ensureOwnership(userId: string, id: string): Promise<AppSelect | null> {
  return db.application.findFirst({
    where: { id, userId },
    select: { id: true, companyName: true, position: true, status: true },
  });
}

async function logActivity(
  userId: string,
  applicationId: string | null,
  type: string,
  message: string,
) {
  await db.activityLog.create({
    data: { userId, applicationId, type: type as never, message },
  });
}

export async function createApplicationAction(
  input: ApplicationInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  const data = parsed.data;

  let companyId = data.companyId ?? null;
  if (!companyId) {
    const existingCompany = await db.company.findFirst({
      where: { userId: session.user.id, name: data.companyName },
      select: { id: true },
    });
    if (existingCompany) {
      companyId = existingCompany.id;
    } else {
      const company = await db.company.create({
        data: {
          userId: session.user.id,
          name: data.companyName,
          location: data.location || undefined,
        },
        select: { id: true },
      });
      companyId = company.id;
    }
  }

  const application = await db.application.create({
    data: {
      userId: session.user.id,
      companyId,
      companyName: data.companyName,
      position: data.position,
      jobDescription: data.jobDescription || null,
      jobUrl: data.jobUrl || null,
      salaryMin: data.salaryMin ? Number(data.salaryMin) : null,
      salaryMax: data.salaryMax ? Number(data.salaryMax) : null,
      currency: data.currency,
      location: data.location || null,
      workMode: (data.workMode as never) ?? null,
      source: (data.source as never) ?? "OTHER",
      applicationDate: new Date(data.applicationDate),
      status: (data.status as never) ?? "APPLIED",
      priority: (data.priority as never) ?? "MEDIUM",
      notes: data.notes || null,
      resumeId: data.resumeId || null,
      coverLetterId: data.coverLetterId || null,
      expectedSalary: data.expectedSalary ? Number(data.expectedSalary) : null,
      rejectionReason: data.rejectionReason || null,
      offerDetails: data.offerDetails || null,
      benefits: data.benefits || null,
    },
    select: { id: true },
  });

  await logActivity(session.user.id, application.id, "CREATED", `Added ${data.position} at ${data.companyName}`);

  revalidatePath("/applications");
  revalidatePath("/kanban");
  revalidatePath("/dashboard");
  revalidatePath("/companies");

  return ok({ id: application.id });
}

export async function updateApplicationAction(
  id: string,
  input: ApplicationInput,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await ensureOwnership(session.user.id, id);
  if (!owned) return fail("Application not found.");

  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  const data = parsed.data;

  await db.application.update({
    where: { id },
    data: {
      companyId: data.companyId ?? null,
      companyName: data.companyName,
      position: data.position,
      jobDescription: data.jobDescription || null,
      jobUrl: data.jobUrl || null,
      salaryMin: data.salaryMin ? Number(data.salaryMin) : null,
      salaryMax: data.salaryMax ? Number(data.salaryMax) : null,
      currency: data.currency,
      location: data.location || null,
      workMode: (data.workMode as never) ?? null,
      source: (data.source as never) ?? "OTHER",
      applicationDate: new Date(data.applicationDate),
      status: (data.status as never) ?? "APPLIED",
      priority: (data.priority as never) ?? "MEDIUM",
      notes: data.notes || null,
      resumeId: data.resumeId || null,
      coverLetterId: data.coverLetterId || null,
      expectedSalary: data.expectedSalary ? Number(data.expectedSalary) : null,
      rejectionReason: data.rejectionReason || null,
      offerDetails: data.offerDetails || null,
      benefits: data.benefits || null,
    },
  });

  await logActivity(session.user.id, id, "UPDATED", `Updated ${data.position} at ${data.companyName}`);

  revalidatePath("/applications");
  revalidatePath("/kanban");
  revalidatePath("/dashboard");
  revalidatePath(`/applications/${id}`);

  return ok(undefined);
}

export async function updateApplicationStatusAction(
  id: string,
  status: ApplicationStatus,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const parsed = applicationStatusUpdateSchema.safeParse({ id, status });
  if (!parsed.success) return failZod(parsed.error);

  const owned = await ensureOwnership(session.user.id, parsed.data.id);
  if (!owned) return fail("Application not found.");

  await db.application.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });

  await logActivity(session.user.id, parsed.data.id, "STATUS_CHANGED", `Moved ${owned.position} at ${owned.companyName} to ${parsed.data.status.replaceAll("_", " ")}`,
  );

  revalidatePath("/applications");
  revalidatePath("/kanban");
  revalidatePath("/dashboard");

  return ok(undefined);
}

export async function deleteApplicationAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await ensureOwnership(session.user.id, id);
  if (!owned) return fail("Application not found.");

  await db.application.delete({ where: { id } });

  await logActivity(session.user.id, null, "DELETED", `Deleted ${owned.position} at ${owned.companyName}`);

  revalidatePath("/applications");
  revalidatePath("/kanban");
  revalidatePath("/dashboard");

  return ok(undefined);
}

export async function toggleBookmarkAction(id: string): Promise<ActionResult<{ bookmarked: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await ensureOwnership(session.user.id, id);
  if (!owned) return fail("Application not found.");

  const current = await db.application.findUnique({
    where: { id },
    select: { bookmarked: true },
  });

  const updated = await db.application.update({
    where: { id },
    data: { bookmarked: !current?.bookmarked },
    select: { bookmarked: true },
  });

  revalidatePath("/applications");
  revalidatePath("/kanban");

  return ok({ bookmarked: updated.bookmarked });
}
