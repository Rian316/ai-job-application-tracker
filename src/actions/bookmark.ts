"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { failZod } from "@/lib/zod";

const bookmarkSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(120),
  jobTitle: z.string().max(160).optional().or(z.literal("")),
  jobUrl: z.string().url("Must be a valid URL").max(500).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export async function createBookmarkAction(
  input: z.infer<typeof bookmarkSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const parsed = bookmarkSchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  const bookmark = await db.bookmark.create({
    data: {
      userId: session.user.id,
      companyName: parsed.data.companyName,
      jobTitle: parsed.data.jobTitle || null,
      jobUrl: parsed.data.jobUrl || null,
      notes: parsed.data.notes || null,
    },
    select: { id: true },
  });

  revalidatePath("/bookmarks");

  return ok({ id: bookmark.id });
}

export async function deleteBookmarkAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await db.bookmark.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!owned) return fail("Bookmark not found.");

  await db.bookmark.delete({ where: { id } });

  revalidatePath("/bookmarks");

  return ok(undefined);
}