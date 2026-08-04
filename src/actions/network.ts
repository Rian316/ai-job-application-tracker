"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { failZod } from "@/lib/zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  companyId: z.string().optional().nullable(),
  companyName: z.string().max(120).optional().or(z.literal("")),
  email: z.string().email("Invalid email").max(200).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  linkedinUrl: z.string().url("Must be a valid URL").max(500).optional().or(z.literal("")),
  position: z.string().max(120).optional().or(z.literal("")),
  contactType: z.enum(["RECRUITER", "HIRING_MANAGER", "EMPLOYEE", "OTHER"]),
  notes: z.string().max(5000).optional().or(z.literal("")),
  followUpAt: z.string().optional().or(z.literal("")),
});

export async function createContactAction(
  input: z.infer<typeof contactSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  if (parsed.data.companyId) {
    const owned = await db.company.findFirst({
      where: { id: parsed.data.companyId, userId: session.user.id },
      select: { id: true },
    });
    if (!owned) return fail("Company not found.");
  }

  const contact = await db.recruiter.create({
    data: {
      userId: session.user.id,
      companyId: parsed.data.companyId || null,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      linkedinUrl: parsed.data.linkedinUrl || null,
      position: parsed.data.position || null,
      contactType: parsed.data.contactType as never,
      notes: parsed.data.notes || null,
      followUpAt: parsed.data.followUpAt ? new Date(parsed.data.followUpAt) : null,
    },
    select: { id: true },
  });

  revalidatePath("/network");

  return ok({ id: contact.id });
}

export async function updateContactFollowUpAction(
  id: string,
  followUpAt: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await db.recruiter.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!owned) return fail("Contact not found.");

  await db.recruiter.update({
    where: { id },
    data: {
      followUpAt: followUpAt ? new Date(followUpAt) : null,
      lastContact: new Date(),
    },
  });

  revalidatePath("/network");

  return ok(undefined);
}

export async function deleteContactAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await db.recruiter.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!owned) return fail("Contact not found.");

  await db.recruiter.delete({ where: { id } });

  revalidatePath("/network");

  return ok(undefined);
}