"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  interviewSchema,
  taskSchema,
  type InterviewInput,
  type TaskInput,
} from "@/validators/application";
import { priorities } from "@/validators/application";
import {
  createInterviewAction,
  completeInterviewAction,
  deleteInterviewAction,
  createTaskAction,
  updateTaskStatusAction,
  deleteTaskAction,
} from "@/actions/interview-task";
import { cn } from "@/lib/utils";

const interviewTypes = [
  "PHONE", "VIDEO", "ONSITE", "TECHNICAL", "BEHAVIORAL", "MANAGER", "PANEL", "FINAL", "OTHER",
] as const;
const taskTypes = [
  "FOLLOW_UP", "INTERVIEW_PREP", "RESUME_UPDATE", "NETWORKING", "DEADLINE", "REMINDER", "CUSTOM",
] as const;

export type InterviewRow = {
  id: string;
  title: string | null;
  type: string;
  scheduledAt: Date;
  duration: number;
  location: string | null;
  meetingUrl: string | null;
  notes: string | null;
  completed: boolean;
};

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  dueAt: Date | null;
  status: string;
};

export function InterviewsSection({
  applicationId,
  interviews,
}: {
  applicationId: string;
  interviews: InterviewRow[];
}) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Interviews ({interviews.length})
        </h3>
        <InterviewDialog applicationId={applicationId} />
      </div>
      {interviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No interviews scheduled yet. Add one to prepare.
        </p>
      ) : (
        <div className="space-y-2">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="flex items-start justify-between gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("text-sm font-medium", interview.completed && "line-through opacity-60")}>
                    {interview.title || interviewTypes.includes(interview.type as never) ? interview.type : "Interview"}
                  </span>
                  <Badge variant="secondary">{interview.type.replaceAll("_", " ").toLowerCase()}</Badge>
                  {interview.completed && (
                    <Badge className="bg-emerald-500/10 text-emerald-500">Completed</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(interview.scheduledAt, "EEEE, MMM d, yyyy · h:mm a")} · {interview.duration} min
                  {interview.location ? ` · ${interview.location}` : ""}
                </p>
                {interview.notes && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {interview.notes}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  title={interview.completed ? "Mark as not completed" : "Mark as completed"}
                  onClick={async () => {
                    const result = await completeInterviewAction(
                      interview.id,
                      !interview.completed,
                    );
                    if (result.success) {
                      toast.success("Updated");
                      router.refresh();
                    } else {
                      toast.error(result.error);
                    }
                  }}
                >
                  <CheckCircle2
                    className={cn("size-4", interview.completed ? "text-emerald-500" : "text-muted-foreground")}
                  />
                </Button>
                <DeleteInterviewButton
                  id={interview.id}
                  onDeleted={() => {
                    toast.success("Interview deleted");
                    router.refresh();
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeleteInterviewButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [isPending, startTransition] = React.useTransition();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive">
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete interview?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteInterviewAction(id);
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

function InterviewDialog({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  const form = useForm<InterviewInput>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      applicationId,
      title: "",
      type: "VIDEO",
      scheduledAt: "",
      duration: "45",
      location: "",
      meetingUrl: "",
      notes: "",
    },
  });

  function onSubmit(values: InterviewInput) {
    startTransition(async () => {
      const result = await createInterviewAction(values);
      if (result.success) {
        toast.success("Interview scheduled");
        setOpen(false);
        form.reset();
        router.refresh();
      } else if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof InterviewInput, { message: messages[0] });
        }
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarPlus className="size-4" />
          Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule interview</DialogTitle>
          <DialogDescription>
            Add an interview for this application.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Intro call with recruiter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {interviewTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.charAt(0) + t.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input type="number" min={5} max={600} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled for <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Google Meet / office address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meetingUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://meet.google.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Who to ask for, prep notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Schedule interview
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function TasksSection({
  applicationId,
  tasks,
}: {
  applicationId: string;
  tasks: TaskRow[];
}) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Tasks ({tasks.length})</h3>
        <TaskDialog applicationId={applicationId} />
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No tasks yet. Follow-ups and prep reminders live here.
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex min-w-0 items-start gap-3">
                <Checkbox
                  checked={task.status === "DONE"}
                  onCheckedChange={(checked) => {
                    startTransitionTaskStatus(task.id, checked ? "DONE" : "TODO", () => router.refresh());
                  }}
                />
                <div className="min-w-0 space-y-1">
                  <span className={cn("text-sm font-medium", task.status === "DONE" && "line-through opacity-60")}>
                    {task.title}
                  </span>
                  <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{task.type.replaceAll("_", " ").toLowerCase()}</Badge>
                    {task.priority && (
                      <span className="capitalize">{task.priority.toLowerCase()} priority</span>
                    )}
                    {task.dueAt && <span>Due {format(task.dueAt, "MMM d")}</span>}
                  </p>
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
          ))}
        </div>
      )}
    </div>
  );
}

function startTransitionTaskStatus(id: string, status: "TODO" | "DONE", onDone: () => void) {
  void updateTaskStatusAction(id, status).then((result) => {
    if (result.success) onDone();
    else toast.error(result.error);
  });
}

function DeleteTaskButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [isPending, startTransition] = React.useTransition();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive">
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

function TaskDialog({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  const form = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "CUSTOM",
      priority: "MEDIUM",
      dueAt: "",
      applicationId,
      recurring: false,
      recurringInterval: undefined,
    },
  });

  function onSubmit(values: TaskInput) {
    startTransition(async () => {
      const result = await createTaskAction(values);
      if (result.success) {
        toast.success("Task added");
        setOpen(false);
        form.reset();
        router.refresh();
      } else if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof TaskInput, { message: messages[0] });
        }
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="size-4" />
          Add task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
          <DialogDescription>Follow-up, prep or reminder for this application.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Send follow-up email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taskTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p.charAt(0) + p.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="dueAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Anything useful..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Add task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
