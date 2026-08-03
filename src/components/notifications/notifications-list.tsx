"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BellOff, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
} from "@/actions/notification";

const typeConfig: Record<string, { label: string; className: string }> = {
  INTERVIEW_REMINDER: { label: "Interview", className: "bg-violet-500/10 text-violet-500" },
  APPLICATION_REMINDER: { label: "Application", className: "bg-blue-500/10 text-blue-500" },
  FOLLOW_UP_REMINDER: { label: "Follow-up", className: "bg-amber-500/10 text-amber-500" },
  WEEKLY_SUMMARY: { label: "Weekly", className: "bg-emerald-500/10 text-emerald-500" },
  TASK_REMINDER: { label: "Task", className: "bg-cyan-500/10 text-cyan-500" },
  SYSTEM: { label: "System", className: "bg-muted text-muted-foreground" },
};

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  status: string;
  createdAt: Date;
};

export function NotificationsList({ notifications }: { notifications: NotificationRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function handleMarkAll() {
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (result.success) {
        toast.success("All notifications marked as read");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {notifications.filter((n) => n.status === "UNREAD").length} unread
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAll}
          disabled={isPending}
        >
          <CheckCheck className="size-4" />
          Mark all read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border py-16 text-center">
          <BellOff className="size-10 text-muted-foreground" />
          <div>
            <p className="font-medium">No notifications</p>
            <p className="text-sm text-muted-foreground">
              Task and interview reminders will show up here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const config =
              typeConfig[notification.type] ?? typeConfig.SYSTEM;
            const unread = notification.status === "UNREAD";
            return (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-lg border p-4",
                  unread && "bg-primary/5",
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      unread ? "bg-primary" : "bg-muted",
                    )}
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{notification.title}</p>
                      <Badge variant="secondary" className={config.className}>
                        {config.label}
                      </Badge>
                    </div>
                    {notification.body && (
                      <p className="text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60">
                      {format(notification.createdAt, "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {notification.link && (
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        href={notification.link}
                        onClick={() => {
                          if (unread) {
                            void markNotificationReadAction(notification.id).then(
                              () => router.refresh(),
                            );
                          }
                        }}
                      >
                        View
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    title="Delete"
                    onClick={async () => {
                      const result = await deleteNotificationAction(notification.id);
                      if (result.success) {
                        toast.success("Notification deleted");
                        router.refresh();
                      } else {
                        toast.error(result.error);
                      }
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}