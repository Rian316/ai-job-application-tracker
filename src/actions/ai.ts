"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { failZod } from "@/lib/zod";
import {
  analyzeResume,
  assistantReply,
  coachReply,
  generateCoverLetter,
  generateFollowUpEmail,
  weeklyReport,
  type CoverLetterInput,
} from "@/lib/ai";

const coverLetterSchema = z.object({
  company: z.string().min(1, "Company is required").max(120),
  position: z.string().min(1, "Position is required").max(160),
  jobDescription: z.string().max(20000).optional().or(z.literal("")),
  resumeId: z.string().optional().nullable(),
  tone: z.string().max(20).optional().or(z.literal("")),
});

const chatSchema = z.object({
  question: z.string().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      }),
    )
    .max(12)
    .default([]),
});

const coachSchema = z.object({
  answer: z.string().min(1).max(6000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(6000),
      }),
    )
    .max(12)
    .default([]),
});

export async function generateCoverLetterAction(
  input: z.infer<typeof coverLetterSchema>,
): Promise<ActionResult<{ id: string; content: string }>> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const parsed = coverLetterSchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  let resumeContent: string | undefined;
  if (parsed.data.resumeId) {
    const resume = await db.resume.findFirst({
      where: { id: parsed.data.resumeId, userId: session.user.id },
      select: { content: true },
    });
    resumeContent = resume?.content ?? undefined;
  }

  const content = await generateCoverLetter({
    company: parsed.data.company,
    position: parsed.data.position,
    jobDescription: parsed.data.jobDescription ?? "",
    resumeContent: resumeContent ?? "",
    tone: parsed.data.tone || undefined,
  } satisfies CoverLetterInput);

  const coverLetter = await db.coverLetter.create({
    data: {
      userId: session.user.id,
      name: `${parsed.data.company} — ${parsed.data.position}`,
      company: parsed.data.company,
      position: parsed.data.position,
      content,
      resumeId: parsed.data.resumeId || null,
    },
    select: { id: true, content: true },
  });

  revalidatePath("/cover-letters");

  return ok({ id: coverLetter.id, content: coverLetter.content ?? "" });
}

export async function deleteCoverLetterAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await db.coverLetter.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!owned) return fail("Cover letter not found.");

  await db.coverLetter.delete({ where: { id } });

  revalidatePath("/cover-letters");

  return ok(undefined);
}

export async function analyzeResumeAction(
  id: string,
): Promise<ActionResult<{ atsScore: number }>> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const resume = await db.resume.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, content: true },
  });
  if (!resume) return fail("Resume not found.");
  if (!resume.content) return fail("This resume has no text to analyze.");

  const analysis = await analyzeResume(resume.content);

  await db.resume.update({
    where: { id },
    data: {
      atsScore: analysis.atsScore,
      analysis: analysis as object,
    },
  });

  revalidatePath("/resumes");

  return ok({ atsScore: analysis.atsScore });
}

const resumeSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  content: z.string().min(50, "Paste at least 50 characters of resume text").max(20000),
});

export async function createResumeAction(
  input: z.infer<typeof resumeSchema>,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const parsed = resumeSchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  const resume = await db.resume.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      content: parsed.data.content,
      isPrimary: false,
    },
    select: { id: true },
  });

  revalidatePath("/resumes");

  return ok({ id: resume.id });
}

export async function setPrimaryResumeAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await db.resume.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!owned) return fail("Resume not found.");

  await db.$transaction([
    db.resume.updateMany({
      where: { userId: session.user.id, isPrimary: true },
      data: { isPrimary: false },
    }),
    db.resume.update({ where: { id }, data: { isPrimary: true } }),
  ]);

  revalidatePath("/resumes");

  return ok(undefined);
}

export async function deleteResumeAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const owned = await db.resume.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!owned) return fail("Resume not found.");

  await db.resume.delete({ where: { id } });

  revalidatePath("/resumes");

  return ok(undefined);
}

export async function assistantChatAction(
  input: z.infer<typeof chatSchema>,
): Promise<ActionResult<{ reply: string }>> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const parsed = chatSchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  const userId = session.user.id;

  const [applications, interviews, offers, rejected, upcoming, openTasks] =
    await Promise.all([
      db.application.count({ where: { userId } }),
      db.interview.count({ where: { userId } }),
      db.application.count({ where: { userId, status: "OFFER" } }),
      db.application.count({ where: { userId, status: "REJECTED" } }),
      db.interview.findMany({
        where: { userId, scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: "asc" },
        take: 3,
        select: {
          scheduledAt: true,
          application: { select: { companyName: true, position: true } },
        },
      }),
      db.task.count({ where: { userId, status: { in: ["TODO", "IN_PROGRESS"] } } }),
    ]);

  const reply = await assistantReply(
    {
      applicationCount: applications,
      interviewCount: interviews,
      offerCount: offers,
      rejectedCount: rejected,
      upcomingInterviews: upcoming.map((i) => ({
        company: i.application?.companyName ?? "Unknown company",
        position: i.application?.position ?? "position",
        when: i.scheduledAt.toISOString(),
      })),
      openTasks,
    },
    parsed.data.history,
    parsed.data.question,
  );

  return ok({ reply });
}

export async function interviewCoachAction(
  input: z.infer<typeof coachSchema>,
): Promise<ActionResult<{ reply: string }>> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const parsed = coachSchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  const reply = await coachReply(parsed.data.history, parsed.data.answer);

  return ok({ reply });
}

export async function generateFollowUpEmailAction(
  applicationId: string,
): Promise<ActionResult<{ subject: string; body: string }>> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const application = await db.application.findFirst({
    where: { id: applicationId, userId: session.user.id },
  });
  if (!application) return fail("Application not found.");

  const [recruiter] = await db.recruiter.findMany({
    where: {
      userId: session.user.id,
      ...(application.companyId ? { companyId: application.companyId } : {}),
    },
    orderBy: { lastContact: "desc" },
    take: 1,
    select: { name: true, email: true },
  });

  const daysSinceApplied = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(application.applicationDate).getTime()) /
        (24 * 60 * 60 * 1000),
    ),
  );

  const body = await generateFollowUpEmail({
    company: application.companyName,
    position: application.position,
    daysSinceApplied,
    status: application.status,
    recruiterName: recruiter?.name ?? null,
    recruiterEmail: recruiter?.email ?? null,
  });

  return ok({
    subject: `Following up on ${application.position} at ${application.companyName}`,
    body,
  });
}

export async function weeklyReportAction(): Promise<
  ActionResult<{ report: string }>
> {
  const session = await auth();
  if (!session?.user?.id) return fail("Not authenticated.");

  const userId = session.user.id;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, applied, interviews, offers, rejected] = await Promise.all([
    db.application.count({ where: { userId } }),
    db.application.count({
      where: { userId, applicationDate: { gte: weekAgo } },
    }),
    db.interview.count({
      where: { userId, scheduledAt: { gte: weekAgo } },
    }),
    db.application.count({ where: { userId, status: "OFFER" } }),
    db.application.count({ where: { userId, status: "REJECTED" } }),
  ]);

  const report = await weeklyReport({
    applied,
    interviews,
    offers,
    rejected,
    responseRate: total > 0 ? Math.round(((offers + interviews) / total) * 100) : 0,
    total,
  });

  return ok({ report });
}