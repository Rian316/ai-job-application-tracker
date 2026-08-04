import { format } from "date-fns";

import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const logs = await db.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity logs"
        description={`Latest ${logs.length} actions across all users`}
      />
      <div className="rounded-lg border">
        {logs.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="divide-y">
            {logs.map((log) => (
              <li key={log.id} className="flex items-start gap-3 p-4 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground">{log.message}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground/60">
                    <Badge variant="secondary" className="text-[10px]">
                      {log.type}
                    </Badge>
                    {log.user?.name ?? log.user?.email ?? "Unknown user"} ·{" "}
                    {format(log.createdAt, "MMM d, yyyy h:mm:ss a")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}