import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ApplicationForm } from "@/components/applications/application-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditApplicationPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id!;

  const [application, resumes, coverLetters] = await Promise.all([
    db.application.findFirst({ where: { id, userId } }),
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

  if (!application) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit application</h1>
        <p className="text-sm text-muted-foreground">
          {application.position} at {application.companyName}
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <ApplicationForm
          mode="edit"
          applicationId={application.id}
          initialData={{
            companyName: application.companyName,
            position: application.position,
            jobDescription: application.jobDescription ?? "",
            jobUrl: application.jobUrl ?? "",
            salaryMin: application.salaryMin != null ? String(application.salaryMin) : "",
            salaryMax: application.salaryMax != null ? String(application.salaryMax) : "",
            currency: application.currency,
            location: application.location ?? "",
            workMode: application.workMode ?? undefined,
            source: application.source,
            applicationDate: application.applicationDate.toISOString().split("T")[0],
            status: application.status,
            priority: application.priority,
            notes: application.notes ?? "",
            resumeId: application.resumeId ?? undefined,
            coverLetterId: application.coverLetterId ?? undefined,
            expectedSalary: application.expectedSalary != null ? String(application.expectedSalary) : "",
            rejectionReason: application.rejectionReason ?? "",
            offerDetails: application.offerDetails ?? "",
            benefits: application.benefits ?? "",
          }}
          resumeOptions={resumes}
          coverLetterOptions={coverLetters}
        />
      </div>
    </div>
  );
}
