"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { failZod } from "@/lib/zod";
import { companySchema, type CompanyInput } from "@/validators/application";

export async function createCompanyAction(
  input: CompanyInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const parsed = companySchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  const data = parsed.data;

  const company = await db.company.create({
    data: {
      userId: session.user.id,
      name: data.name,
      industry: data.industry || null,
      size: data.size || null,
      glassdoorRating: data.glassdoorRating ? Number(data.glassdoorRating) : null,
      website: data.website || null,
      location: data.location || null,
      notes: data.notes || null,
      interviewExperience: data.interviewExperience || null,
      salaryRange: data.salaryRange || null,
      pros: data.pros || null,
      cons: data.cons || null,
    },
    select: { id: true },
  });

  revalidatePath("/companies");
  revalidatePath("/applications");

  return ok({ id: company.id });
}

export async function updateCompanyAction(
  id: string,
  input: CompanyInput,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await db.company.findFirst({ where: { id, userId: session.user.id }, select: { id: true } });
  if (!owned) return fail("Company not found.");

  const parsed = companySchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  const data = parsed.data;

  await db.company.update({
    where: { id },
    data: {
      name: data.name,
      industry: data.industry || null,
      size: data.size || null,
      glassdoorRating: data.glassdoorRating ? Number(data.glassdoorRating) : null,
      website: data.website || null,
      location: data.location || null,
      notes: data.notes || null,
      interviewExperience: data.interviewExperience || null,
      salaryRange: data.salaryRange || null,
      pros: data.pros || null,
      cons: data.cons || null,
    },
  });

  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);

  return ok(undefined);
}

export async function deleteCompanyAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await db.company.findFirst({ where: { id, userId: session.user.id }, select: { id: true } });
  if (!owned) return fail("Company not found.");

  await db.company.delete({ where: { id } });

  revalidatePath("/companies");

  return ok(undefined);
}
