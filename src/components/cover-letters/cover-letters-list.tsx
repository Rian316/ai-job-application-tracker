"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
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
import { generateCoverLetterAction, deleteCoverLetterAction } from "@/actions/ai";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type CoverLetterRow = {
  id: string;
  name: string;
  company: string | null;
  position: string | null;
  content: string | null;
  createdAt: Date;
};

type ResumeOption = { id: string; name: string };

const generateSchema = z.object({
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  jobDescription: z.string().optional(),
  resumeId: z.string().optional(),
  tone: z.string().optional(),
});

export function CoverLettersList({
  coverLetters,
  resumes,
}: {
  coverLetters: CoverLetterRow[];
  resumes: ResumeOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof generateSchema>>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      company: "",
      position: "",
      jobDescription: "",
      resumeId: "",
      tone: "professional",
    },
  });

  const selected = coverLetters.find((c) => c.id === selectedId) ?? null;

  function onSubmit(values: z.infer<typeof generateSchema>) {
    startTransition(async () => {
      const result = await generateCoverLetterAction({
        ...values,
        resumeId: values.resumeId || null,
      });
      if (result.success) {
        toast.success("Cover letter generated");
        setOpen(false);
        form.reset();
        router.refresh();
      } else if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof typeof generateSchema.shape, {
            message: messages[0],
          });
        }
      } else {
        toast.error(result.error);
      }
    });
  }

  function deleteCoverLetter(id: string) {
    startTransition(async () => {
      const result = await deleteCoverLetterAction(id);
      if (result.success) {
        toast.success("Cover letter deleted");
        setSelectedId(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-2 lg:col-span-2">
        {coverLetters.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border py-16 text-center">
            <FileText className="size-10 text-muted-foreground" />
            <p className="font-medium">No cover letters yet</p>
            <p className="text-sm text-muted-foreground">
              Generate one with AI for any application.
            </p>
          </div>
        ) : (
          coverLetters.map((coverLetter) => (
            <button
              key={coverLetter.id}
              type="button"
              onClick={() => setSelectedId(coverLetter.id)}
              className={cn(
                "w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent",
                selectedId === coverLetter.id && "border-primary bg-accent/50",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{coverLetter.name}</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete cover letter?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => deleteCoverLetter(coverLetter.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {coverLetter.company ?? "—"} ·{" "}
                {format(coverLetter.createdAt, "MMM d, yyyy")}
              </p>
            </button>
          ))
        )}
      </div>

      <div className="lg:col-span-3">
        {selected ? (
          <div className="rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">{selected.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {selected.company ?? ""}
                  {selected.position ? ` — ${selected.position}` : ""}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                    selected.content ?? "",
                  )}`}
                  download={`${(selected.name ?? "cover-letter")
                    .replace(/[^\w-]+/g, "-")
                    .toLowerCase()}.txt`}
                >
                  Download
                </a>
              </Button>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {selected.content}
            </p>
          </div>
        ) : (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
            <Sparkles className="size-8 text-primary" />
            <p className="text-sm font-medium">Generate with AI</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Pick a company and position; the assistant drafts a tailored
              cover letter from the job description and your resume.
            </p>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="fixed bottom-6 right-6 z-10 shadow-lg sm:static sm:z-auto sm:shadow-none">
            <Plus className="size-4" />
            Generate cover letter
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate cover letter</DialogTitle>
            <DialogDescription>
              The AI writes a tailored draft you can edit and reuse.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company *</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position *</FormLabel>
                      <FormControl>
                        <Input placeholder="Senior Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Paste the job description for a better match…"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="resumeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {resumes.map((resume) => (
                            <SelectItem key={resume.id} value={resume.id}>
                              {resume.name}
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
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["professional", "friendly", "enthusiastic", "concise"].map(
                            (tone) => (
                              <SelectItem key={tone} value={tone} className="capitalize">
                                {tone}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  Generate
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}