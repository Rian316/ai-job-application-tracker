import Link from "next/link";
import {
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { format, startOfMonth, startOfWeek } from "date-fns";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { statusConfig, priorityConfig } from "@/lib/status";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const monthStart = startOfMonth(new Date());
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const [applications, interviews, tasks, settings, activityLogs] =
    await Promise.all([
      db.application.findMany({
        where: { userId },
        orderBy: { applicationDate: "desc" },
        take: 6,
      }),
      db.interview.findMany({
        where: { userId, scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: "asc" },
        take: 3,
      }),
      db.task.findMany({
        where: { userId, status: { in: ["TODO", "IN_PROGRESS"] } },
        orderBy: { dueAt: "asc" },
        take: 4,
      }),
      db.settings.findUnique({ where: { userId } }),
      db.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const [monthCount, weekCount, offerCount, rejectedCount, interviewCount] =
    await Promise.all([
      db.application.count({ where: { userId, applicationDate: { gte: monthStart } } }),
      db.application.count({ where: { userId, applicationDate: { gte: weekStart } } }),
      db.application.count({ where: { userId, status: "OFFER" } }),
      db.application.count({ where: { userId, status: "REJECTED" } }),
      db.interview.count({ where: { userId } }),
    ]);

  const totalApps = await db.application.count({ where: { userId } });
  const responseRate = totalApps > 0 ? Math.round(((rejectedCount + offerCount + interviewCount) / totalApps) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")} · Here&apos;s your job search overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/applications/new">
              <Briefcase className="size-4" />
              Add application
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/assistant">Ask AI</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label="Applications this month"
          value={monthCount}
          hint={`Weekly goal: ${settings?.weeklyGoal ?? 5}/week · ${weekCount} this week`}
        />
        <StatCard
          icon={CalendarDays}
          label="Interviews"
          value={interviewCount}
          hint="Total interviews scheduled"
        />
        <StatCard
          icon={CheckCircle2}
          label="Offers"
          value={offerCount}
          hint="Applications with offers"
          accent="text-emerald-500"
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={rejectedCount}
          hint="Don't give up"
          accent="text-rose-500"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Recent applications</CardTitle>
                <CardDescription>Your latest activity</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/applications">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {applications.length === 0 ? (
                <EmptyState
                  title="No applications yet"
                  description="Track your first application to start building your pipeline."
                  cta={{ href: "/applications", label: "Add an application" }}
                />
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{app.position}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {app.companyName}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <Badge variant="secondary" className="font-normal">
                        {app.companyName}
                      </Badge>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activityLogs.length === 0 ? (
                <EmptyState
                  title="No activity yet"
                  description="Your actions will appear here."
                />
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 text-sm">
                    <ActivityDot type={log.type} />
                    <span className="flex-1 text-muted-foreground">{log.message}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {format(log.createdAt, "MMM d")}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming interviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {interviews.length === 0 ? (
                <EmptyState
                  title="No interviews yet"
                  description="Scheduled interviews will show up here."
                />
              ) : (
                interviews.map((interview) => (
                  <div key={interview.id} className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {interview.title ?? "Interview"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(interview.scheduledAt, "EEE, MMM d 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.length === 0 ? (
                <EmptyState
                  title="All caught up!"
                  description="No open tasks."
                />
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{task.title}</p>
                      {task.dueAt && (
                        <p className="text-xs text-muted-foreground">
                          Due {format(task.dueAt, "EEE, MMM d")}
                        </p>
                      )}
                    </div>
                    <TaskBadge priority={task.priority} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-semibold">{responseRate}%</div>
                <TrendingUp className="size-5 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Briefcase;
  label: string;
  value: number;
  hint?: string;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <Icon className={cn("size-4 text-muted-foreground", accent)} />
        </div>
        <div className="mt-3 text-2xl font-semibold">{value}</div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig];
  return (
    <Badge
      className={cn("font-normal", config?.className ?? "bg-muted text-muted-foreground")}
      variant="secondary"
    >
      {config?.label ?? status.replaceAll("_", " ")}
    </Badge>
  );
}

function TaskBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority as keyof typeof priorityConfig];
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs",
        config?.className ?? "bg-muted text-muted-foreground",
      )}
    >
      {priority.toLowerCase()}
    </span>
  );
}

function ActivityDot({ type }: { type: string }) {
  const color =
    type === "AI_GENERATION"
      ? "bg-primary"
      : type === "STATUS_CHANGED"
        ? "bg-amber-500"
        : type === "INTERVIEW_SCHEDULED"
          ? "bg-emerald-500"
          : "bg-muted-foreground";
  return <span className={cn("size-2 shrink-0 rounded-full", color)} />;
}

function EmptyState({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-8 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
      {cta && (
        <Button asChild variant="outline" size="sm" className="mt-2">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      )}
    </div>
  );
}