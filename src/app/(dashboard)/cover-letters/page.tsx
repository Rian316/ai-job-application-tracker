import type { Metadata } from "next";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import {
  CoverLettersList,
  type CoverLetterRow,
} from "@/components/cover-letters/cover-letters-list";

export const metadata: Metadata = {
  title: "Cover Letters",
};

export const dynamic = "force-dynamic";

export default async function CoverLettersPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const [coverLetters, resumes] = await Promise.all([
    db.coverLetter.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    db.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cover Letters"
        description="AI-generated drafts tailored to each application."
      />
      <CoverLettersList
        coverLetters={coverLetters as unknown as CoverLetterRow[]}
        resumes={resumes}
      />
    </div>
  );
}