import { CircleCheck, HardDrive, Users, Briefcase } from "lucide-react";
import { format } from "date-fns";

import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [userCount, applicationCount, companyCount, subscriptionCount, recentLogs, dbOk] =
    await Promise.all([
      db.user.count(),
      db.application.count(),
      db.company.count(),
      db.subscription.count(),
      db.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true, email: true } } },
      }),
      db.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
    ]);

  const health = [
    { label: "Database", value: dbOk ? "Connected" : "Down", ok: dbOk, icon: HardDrive },
    { label: "Users", value: userCount, icon: Users },
    { label: "Applications", value: applicationCount, icon: Briefcase },
    { label: "Companies", value: companyCount, icon: Briefcase },
    { label: "Subscriptions", value: subscriptionCount, icon: CircleCheck },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin"
        description="Platform overview, users, subscriptions and activity."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {health.map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <item.icon className="size-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
              <p
                className={
                  item.ok === false
                    ? "mt-1 text-2xl font-bold text-destructive"
                    : "mt-1 text-2xl font-bold"
                }
              >
                {item.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest actions across all users</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ol className="space-y-3">
              {recentLogs.map((log) => (
                <li key={log.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground">{log.message}</p>
                    <p className="text-xs text-muted-foreground/60">
                      {log.user?.name ?? log.user?.email ?? "Unknown user"} ·{" "}
                      {format(log.createdAt, "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}