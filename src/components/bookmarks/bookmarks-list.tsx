"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bookmark as BookmarkIcon, ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

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
import {
  createBookmarkAction,
  deleteBookmarkAction,
} from "@/actions/bookmark";

export type BookmarkRow = {
  id: string;
  companyName: string;
  jobTitle: string | null;
  jobUrl: string | null;
  notes: string | null;
  createdAt: Date;
};

const bookmarkFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().optional(),
  jobUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export function BookmarksList({ bookmarks }: { bookmarks: BookmarkRow[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof bookmarkFormSchema>>({
    resolver: zodResolver(bookmarkFormSchema),
    defaultValues: {
      companyName: "",
      jobTitle: "",
      jobUrl: "",
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof bookmarkFormSchema>) {
    startTransition(async () => {
      const result = await createBookmarkAction(values);
      if (result.success) {
        toast.success("Bookmark added");
        setOpen(false);
        form.reset();
        router.refresh();
      } else if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof typeof bookmarkFormSchema.shape, {
            message: messages[0],
          });
        }
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border py-16 text-center">
          <BookmarkIcon className="size-10 text-muted-foreground" />
          <p className="font-medium">No bookmarks yet</p>
          <p className="text-sm text-muted-foreground">
            Save interesting job postings to review later.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{bookmark.companyName}</p>
                  {bookmark.jobTitle && (
                    <p className="truncate text-sm text-muted-foreground">
                      {bookmark.jobTitle}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {bookmark.jobUrl && (
                    <Button asChild variant="ghost" size="icon" className="size-7">
                      <a href={bookmark.jobUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete bookmark?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => {
                            startTransition(async () => {
                              const result = await deleteBookmarkAction(bookmark.id);
                              if (result.success) {
                                toast.success("Bookmark deleted");
                                router.refresh();
                              } else {
                                toast.error(result.error);
                              }
                            });
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {bookmark.notes && (
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {bookmark.notes}
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground/60">
                Saved {format(bookmark.createdAt, "MMM d, yyyy")}
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="size-4" />
            Add bookmark
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add bookmark</DialogTitle>
            <DialogDescription>
              Save a job posting or company to check later.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="companyName"
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
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job title</FormLabel>
                      <FormControl>
                        <Input placeholder="Staff Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="jobUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Why this one is interesting…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Save bookmark
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}