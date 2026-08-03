import { CheckCircle2, Circle, Clock, Inbox } from "lucide-react";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskItem } from "@/components/tasks/task-item";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const tasks = await db.task.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }],
    include: { application: { select: { id: true, position: true, companyName: true } } },
  });

  const open = tasks.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS");
  const done = tasks.filter((t) => t.status === "DONE");
  const now = new Date();
  const overdueCount = open.filter(
    (t) => t.dueAt && t.dueAt < now,
  ).length;
  const activeCount = open.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description={`${activeCount} active · ${overdueCount} overdue`}
      >
        <TaskDialog />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Circle className="size-4 text-muted-foreground" />
              To do
              <Badge variant="secondary">{open.length}</Badge>
            </h2>
            {overdueCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <Clock className="size-3" />
                {overdueCount} overdue
              </Badge>
            )}
          </div>
          {open.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {open.map((task) => {
                const isOverdue = task.dueAt !== null && task.dueAt < now;
                return (
                  <TaskItem
                    key={task.id}
                    task={{
                      ...task,
                      application: task.application
                        ? { ...task.application, id: task.applicationId ?? "" }
                        : null,
                    }}
                    overdue={isOverdue}
                  />
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="size-4 text-muted-foreground" />
            Completed
            <Badge variant="secondary">{done.length}</Badge>
          </h2>
          {done.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {done.map((task) => (
                <TaskItem
                  key={task.id}
                  task={{
                    ...task,
                    application: task.application
                      ? { ...task.application, id: task.applicationId ?? "" }
                      : null,
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
      <Inbox className="size-8 text-muted-foreground/60" />
      <p className="text-sm text-muted-foreground">Nothing here yet</p>
    </div>
  );
}