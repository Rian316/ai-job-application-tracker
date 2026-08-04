import Link from "next/link";
import { FileText, FileType, FolderOpen, Layers } from "lucide-react";
import { format } from "date-fns";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const [resumes, coverLetters, attachments] = await Promise.all([
    db.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, name: true, atsScore: true, isPrimary: true, updatedAt: true },
    }),
    db.coverLetter.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, name: true, company: true, updatedAt: true },
    }),
    db.attachment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, category: true, url: true, createdAt: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Everything in one place: resumes, cover letters and files."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Resumes</CardTitle>
              <CardDescription>Versions + ATS scores</CardDescription>
            </div>
            <Layers className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No resumes yet.</p>
            ) : (
              resumes.map((resume) => (
                <Link
                  key={resume.id}
                  href="/resumes"
                  className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      {resume.name}
                      {resume.isPrimary && (
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          primary
                        </Badge>
                      )}
                    </span>
                  </span>
                  {resume.atsScore !== null && (
                    <span className="shrink-0 text-muted-foreground">
                      {resume.atsScore}
                    </span>
                  )}
                </Link>
              ))
            )}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/resumes">Open library</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Cover letters</CardTitle>
              <CardDescription>AI-generated drafts</CardDescription>
            </div>
            <FileType className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {coverLetters.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cover letters yet.</p>
            ) : (
              coverLetters.map((letter) => (
                <Link
                  key={letter.id}
                  href="/cover-letters"
                  className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FileType className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{letter.name}</span>
                  </span>
                  {letter.company && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {letter.company}
                    </span>
                  )}
                </Link>
              ))
            )}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/cover-letters">Open library</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Attachments</CardTitle>
              <CardDescription>Files you have uploaded</CardDescription>
            </div>
            <FolderOpen className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attachments yet.</p>
            ) : (
              attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{attachment.name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {attachment.category.replaceAll("_", " ").toLowerCase()} ·{" "}
                    {format(attachment.createdAt, "MMM d")}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}