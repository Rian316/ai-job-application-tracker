"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Plus, Sparkles, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  analyzeResumeAction,
  createResumeAction,
  setPrimaryResumeAction,
  deleteResumeAction,
} from "@/actions/ai";

export type ResumeRow = {
  id: string;
  name: string;
  content: string | null;
  atsScore: number | null;
  isPrimary: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  analysis?: {
    atsScore?: number;
    strengths?: string[];
    weaknesses?: string[];
    suggestions?: string[];
  } | null;
};

const createSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  content: z.string().min(50, "Paste at least 50 characters").max(20000),
});

export function ResumeLibrary({ resumes }: { resumes: ResumeRow[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", content: "" },
  });

  const selected = resumes.find((r) => r.id === selectedId) ?? resumes[0] ?? null;

  function onSubmit(values: z.infer<typeof createSchema>) {
    startTransition(async () => {
      const result = await createResumeAction(values);
      if (result.success) {
        toast.success("Resume created");
        setOpen(false);
        form.reset();
        router.refresh();
      } else if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof typeof createSchema.shape, {
            message: messages[0],
          });
        }
      } else {
        toast.error(result.error);
      }
    });
  }

  function analyze(id: string) {
    setAnalyzingId(id);
    startTransition(async () => {
      const result = await analyzeResumeAction(id);
      setAnalyzingId(null);
      if (result.success) {
        toast.success(`ATS score: ${result.data.atsScore}/100`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function makePrimary(id: string) {
    startTransition(async () => {
      const result = await setPrimaryResumeAction(id);
      if (result.success) {
        toast.success("Primary resume updated");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteResumeAction(id);
      if (result.success) {
        toast.success("Resume deleted");
        if (selectedId === id) setSelectedId(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  const analysis = selected?.analysis;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-2 lg:col-span-2">
        {resumes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border py-16 text-center">
            <FileText className="size-10 text-muted-foreground" />
            <p className="font-medium">No resumes yet</p>
            <p className="text-sm text-muted-foreground">
              Paste your resume text and get an instant ATS analysis.
            </p>
          </div>
        ) : (
          resumes.map((resume) => (
            <button
              key={resume.id}
              type="button"
              onClick={() => setSelectedId(resume.id)}
              className={cn(
                "w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent",
                selected?.id === resume.id && "border-primary bg-accent/50",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 truncate text-sm font-medium">
                  {resume.isPrimary && <Star className="size-3.5 fill-amber-400 text-amber-400" />}
                  <span className="truncate">{resume.name}</span>
                </p>
                {resume.atsScore !== null && (
                  <Badge
                    variant={resume.atsScore >= 80 ? "default" : resume.atsScore >= 60 ? "secondary" : "destructive"}
                  >
                    {resume.atsScore}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                v{resume.version} · {format(resume.updatedAt, "MMM d, yyyy")}
              </p>
            </button>
          ))
        )}
      </div>

      <div className="lg:col-span-3">
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
              <div>
                <h2 className="font-semibold">{selected.name}</h2>
                <p className="text-sm text-muted-foreground">
                  v{selected.version}
                  {selected.isPrimary && " · primary"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!selected.isPrimary && (
                  <Button variant="outline" size="sm" onClick={() => makePrimary(selected.id)}>
                    <Star className="size-3.5" />
                    Set primary
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => analyze(selected.id)}
                  disabled={analyzingId === selected.id}
                >
                  {analyzingId === selected.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  Analyze with AI
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete resume?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => remove(selected.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {analysis ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-semibold">ATS score</p>
                  <p className="mt-1 text-3xl font-bold">
                    {analysis.atsScore ?? selected.atsScore ?? "—"}
                    <span className="text-base font-normal text-muted-foreground">/100</span>
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-semibold">Strengths</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {(analysis.strengths ?? []).map((strength, i) => (
                      <li key={i}>• {strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-semibold">Weaknesses</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {(analysis.weaknesses ?? []).map((weakness, i) => (
                      <li key={i}>• {weakness}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-semibold">Suggestions</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
                    {(analysis.suggestions ?? []).map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
                <Sparkles className="size-8 text-primary" />
                <p className="text-sm font-medium">Not analyzed yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Run an AI analysis to get an ATS score, strengths, weaknesses
                  and concrete improvement suggestions.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
            <FileText className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Select a resume</p>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="fixed bottom-6 right-6 z-10 shadow-lg sm:static sm:z-auto sm:shadow-none">
            <Plus className="size-4" />
            Add resume
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add resume</DialogTitle>
            <DialogDescription>
              Paste your resume text to run AI analysis.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Resume v4 - tailored for backend roles" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume text *</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={10}
                        placeholder={"Jane Doe\njane@example.com · +1 555 0100\n\nEXPERIENCE\nSenior Engineer, Acme (2020–present)\n..."}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Add resume
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}