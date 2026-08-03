import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Bookmark,
  Briefcase,
  CalendarDays,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  Pencil,
  Workflow,
} from "lucide-react";
import { format } from "date-fns";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { statusConfig, priorityConfig, sourceConfig, workModeConfig } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusStepper } from "@/components/applications/status-stepper";
import {
  InterviewsSection,
  TasksSection,
} from "@/components/applications/detail-sections";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id!;

  const [application, interviews, tasks, activityLogs] =
    await Promise.all([
      db.application.findFirst({
        where: { id, userId },
        include: { company: true, resume: { select: { id: true, name: true } }, coverLetter: { select: { id: true, name: true } } },
      }),
      db.interview.findMany({
        where: { applicationId: id, userId },
        orderBy: { scheduledAt: "asc" },
      }),
      db.task.findMany({
        where: { applicationId: id, userId },
        orderBy: { createdAt: "desc" },
      }),
      db.activityLog.findMany({
        where: { applicationId: id, userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  if (!application) notFound();

  const status = statusConfig[application.status as keyof typeof statusConfig];
  const priority = priorityConfig[application.priority as keyof typeof priorityConfig];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {application.bookmarked && (
                <Bookmark className="size-5 fill-amber-400 text-amber-400" />
              )}
              <h1 className="text-2xl font-semibold tracking-tight">
                {application.position}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="size-4" />
                {application.companyName}
              </span>
              {application.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  {application.location}
                </span>
              )}
              {application.workMode && (
                <Badge variant="secondary">{workModeConfig[application.workMode]}</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {application.jobUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={application.jobUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Job posting
                </a>
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href={`/applications/${application.id}/edit`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={status?.className}>{status?.label ?? application.status}</Badge>
          <Badge variant="secondary" className={priority?.className}>
            {priority?.label} priority
          </Badge>
          <Badge variant="outline">{sourceConfig[application.source as keyof typeof sourceConfig] ?? application.source}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            Applied {format(application.applicationDate, "MMM d, yyyy")}
          </span>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Workflow className="size-4" />
            Progress
          </div>
          <StatusStepper
            currentStatus={application.status}
            applicationId={application.id}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={Building2} label="Company">
                  {application.company ? (
                    <Link href={`/companies/${application.company.id}`} className="font-medium hover:underline">
                      {application.company.name}
                    </Link>
                  ) : (
                    <span className="font-medium">{application.companyName}</span>
                  )}
                </InfoRow>
                <InfoRow icon={Briefcase} label="Position">
                  {application.position}
                </InfoRow>
                {application.salaryMin != null && application.salaryMax != null ? (
                  <InfoRow icon={DollarSign} label="Salary range">
                    {application.currency} {Number(application.salaryMin).toLocaleString()} â€“ {Number(application.salaryMax).toLocaleString()}
                  </InfoRow>
                ) : application.expectedSalary != null ? (
                  <InfoRow icon={DollarSign} label="Expected salary">
                    {application.currency} {Number(application.expectedSalary).toLocaleString()}
                  </InfoRow>
                ) : null}
                <InfoRow icon={Clock} label="Last updated">
                  {format(application.updatedAt, "MMM d, yyyy")}
                </InfoRow>
              </div>

              {application.resume && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Resume used</p>
                    <p className="mt-1">{application.resume.name}</p>
                  </div>
                </>
              )}
              {application.coverLetter && (
                <div className="text-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cover letter used</p>
                  <p className="mt-1">{application.coverLetter.name}</p>
                </div>
              )}

              {application.jobDescription && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Job description</p>
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                      {application.jobDescription}
                    </pre>
                  </div>
                </>
              )}

              {application.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Notes</p>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{application.notes}</p>
                  </div>
                </>
              )}

              {application.offerDetails && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Offer details</p>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{application.offerDetails}</p>
                  </div>
                </>
              )}

              {application.rejectionReason && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rejection reason</p>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{application.rejectionReason}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <InterviewsSection applicationId={application.id} interviews={interviews} />
              <Separator />
              <TasksSection applicationId={application.id} tasks={tasks} />
            </CardContent>
          </Card>
        </div>
      </div>

      {activityLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {activityLogs.map((log) => (
                <li key={log.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground">{log.message}</p>
                    <p className="text-xs text-muted-foreground/60">
                      {format(log.createdAt, "MMM d, yyyy Â· h:mm a")}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Building2;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm">{children}</p>
      </div>
    </div>
  );
}
