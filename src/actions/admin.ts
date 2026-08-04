"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ok, fail, type ActionResult } from "@/lib/action-result";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role !== "ADMIN") return null;
  return session.user.id;
}

export async function updateUserRoleAction(
  userId: string,
  role: "USER" | "ADMIN",
): Promise<ActionResult> {
  const adminId = await requireAdmin();
  if (!adminId) return fail("Admin access required.");

  if (userId === adminId && role !== "ADMIN") {
    return fail("You cannot remove your own admin role.");
  }

  await db.user.update({ where: { id: userId }, data: { role } });

  revalidatePath("/admin");

  return ok(undefined);
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  const adminId = await requireAdmin();
  if (!adminId) return fail("Admin access required.");

  if (userId === adminId) {
    return fail("You cannot delete your own account.");
  }

  await db.user.delete({ where: { id: userId } });

  revalidatePath("/admin");

  return ok(undefined);
}