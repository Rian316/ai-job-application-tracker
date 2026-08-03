import type { Metadata } from "next";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { ResumeLibrary, type ResumeRow } from "@/components/resumes/resume-library";

export const metadata: Metadata = {
  title: "Resume Library",
};

export const dynamic = "force-dynamic";

export default async function ResumesPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const resumes = await db.resume.findMany({
    where: { userId },
    orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Library"
        description="Store versions, run AI ATS analysis and pick your primary resume."
      />
      <ResumeLibrary resumes={resumes as unknown as ResumeRow[]} />
    </div>
  );
}