"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarDays, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  updateTaskStatusAction,
  deleteTaskAction,
} from "@/actions/interview-task";
import { cn } from "@/lib/utils";

type TaskItemData = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  dueAt: Date | null;
  status: string;
  application?: {
    id: string;
    position: string;
    companyName: string;
  } | null;
};

const taskTypeLabels: Record<string, string> = {
  FOLLOW_UP: "Follow up",
  INTERVIEW_PREP: "Interview prep",
  RESUME_UPDATE: "Resume update",
  NETWORKING: "Networking",
  DEADLINE: "Deadline",
  REMINDER: "Reminder",
  CUSTOM: "Custom",
};

const priorityClass: Record<string, string> = {
  HIGH: "border-red-500/30 bg-red-500/10 text-red-500",
  URGENT: "border-red-500/50 bg-red-500/15 text-red-500",
  MEDIUM: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  LOW: "border-muted bg-muted/50 text-muted-foreground",
};

export function TaskItem({ task, overdue }: { task: TaskItemData; overdue?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const done = task.status === "DONE";

  function toggleStatus() {
    startTransition(async () => {
      const result = await updateTaskStatusAction(task.id, done ? "TODO" : "DONE");
      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-lg border p-3",
        overdue && "border-destructive/40 bg-destructive/5",
        done && "opacity-60",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <Checkbox checked={done} onCheckedChange={toggleStatus} disabled={isPending} className="mt-0.5" />
        <div className="min-w-0 space-y-1">
          <p className={cn("text-sm font-medium", done && "line-through")}>{task.title}</p>
          {task.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {task.type !== "CUSTOM" && (
              <Badge variant="secondary">
                {taskTypeLabels[task.type] ?? task.type.replaceAll("_", " ").toLowerCase()}
              </Badge>
            )}
            {task.priority !== "MEDIUM" && (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  priorityClass[task.priority] ?? priorityClass.LOW,
                )}
              >
                {task.priority.toLowerCase()}
              </span>
            )}
            {task.dueAt && (
              <span
                className={cn(
                  "flex items-center gap-1",
                  overdue && "font-medium text-destructive",
                )}
              >
                {overdue ? (
                  <AlertTriangle className="size-3" />
                ) : (
                  <CalendarDays className="size-3" />
                )}
                {format(task.dueAt, "MMM d, h:mm a")}
              </span>
            )}
            {task.application && (
              <Link
                href={`/applications/${task.application.id}`}
                className="flex min-w-0 items-center gap-1 hover:underline"
              >
                <span className="truncate">
                  {task.application.companyName} — {task.application.position}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
      <DeleteTaskButton
        id={task.id}
        onDeleted={() => {
          toast.success("Task deleted");
          router.refresh();
        }}
      />
    </div>
  );
}

function DeleteTaskButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [isPending, startTransition] = React.useTransition();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground hover:text-destructive">
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete task?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteTaskAction(id);
                if (result.success) onDeleted();
                else toast.error(result.error);
              })
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}