import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ApplicationForm } from "@/components/applications/application-form";

export const dynamic = "force-dynamic";

export default async function NewApplicationPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [resumes, coverLetters] = await Promise.all([
    db.resume.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    db.coverLetter.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Add application
        </h1>
        <p className="text-sm text-muted-foreground">
          Track a new job application. Fields marked * are required.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <ApplicationForm
          mode="create"
          resumeOptions={resumes}
          coverLetterOptions={coverLetters}
        />
      </div>
    </div>
  );
}
