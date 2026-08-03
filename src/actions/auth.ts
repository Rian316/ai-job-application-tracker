"use server";

import { randomBytes } from "crypto";
import { addHours } from "date-fns";
import { AuthError } from "next-auth";

import { auth, signIn } from "@/auth";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { sendResetPasswordEmail, sendWelcomeEmail } from "@/lib/email";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { failZod } from "@/lib/zod";
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileSchema,
  changePasswordSchema,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type ProfileInput,
  type ChangePasswordInput,
} from "@/validators/auth";


export async function registerAction(
  input: RegisterInput,
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return failZod(parsed.error);
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return fail("An account with this email already exists.", {
      email: ["An account with this email already exists."],
    });
  }

  const user = await db.user.create({
    data: {
      name,
      email: normalizedEmail,
      password: await hashPassword(password),
    },
  });

  await db.settings.create({ data: { userId: user.id } });
  await db.userGoal.create({ data: { userId: user.id } });
  await db.emailSubscription.create({ data: { userId: user.id } });

  await db.activityLog.create({
    data: { userId: user.id, type: "CREATED", message: "Account created" },
  });

  void sendWelcomeEmail(normalizedEmail, name);

  try {
    await signIn("credentials", { email: normalizedEmail, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return ok(undefined);
    }
    throw error;
  }

  return ok(undefined);
}

export async function loginAction(input: { email: string; password: string }): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email: input.email,
      password: input.password,
      redirect: false,
    });
    return ok(undefined);
  } catch (error) {
    if (error instanceof AuthError) {
      return fail("Invalid email or password.");
    }
    throw error;
  }
}

export async function forgotPasswordAction(
  input: ForgotPasswordInput,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return failZod(parsed.error);
  }

  const { email } = parsed.data;
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

  // Always return success to avoid user enumeration.
  if (!user) return ok(undefined);

  const token = randomBytes(32).toString("hex");
  await db.verificationToken.create({
    data: {
      identifier: `reset:${user.id}`,
      token,
      expires: addHours(new Date(), 1),
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
  void sendResetPasswordEmail(user.email!, user.name, resetUrl);

  return ok(undefined);
}

export async function resetPasswordAction(
  input: ResetPasswordInput,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return failZod(parsed.error);
  }

  const { token, password } = parsed.data;

  const record = await db.verificationToken.findUnique({ where: { token } });
  if (!record) {
    return fail("This reset link is invalid. Please request a new one.", {
      token: ["Invalid or expired link."],
    });
  }

  if (record.expires < new Date()) {
    return fail("This reset link has expired. Please request a new one.", {
      token: ["Expired link."],
    });
  }

  const userId = record.identifier.replace("reset:", "");
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user?.email) {
    return fail("User not found.");
  }

  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { password: await hashPassword(password) } }),
    db.verificationToken.delete({ where: { token } }),
  ]);

  await db.activityLog.create({
    data: { userId, type: "UPDATED", message: "Password reset" },
  });

  return ok(undefined);
}

export async function updateProfileAction(
  input: ProfileInput,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return failZod(parsed.error);
  }

  const { name, email } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await db.user.findFirst({
    where: { email: normalizedEmail, id: { not: session.user.id } },
  });
  if (existing) {
    return fail("This email is already in use.", {
      email: ["This email is already in use."],
    });
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { name, email: normalizedEmail },
  });

  return ok(undefined);
}

export async function changePasswordAction(
  input: ChangePasswordInput,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return failZod(parsed.error);
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.password) {
    return fail("Your account uses social login and has no password set.");
  }

  const valid = await verifyPassword(parsed.data.currentPassword, user.password);
  if (!valid) {
    return fail("Current password is incorrect.", {
      currentPassword: ["Current password is incorrect."],
    });
  }

  await db.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(parsed.data.newPassword) },
  });

  return ok(undefined);
}
