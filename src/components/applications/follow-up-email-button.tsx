"use client";

import * as React from "react";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateFollowUpEmailAction } from "@/actions/ai";

export function FollowUpEmailButton({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<{
    subject: string;
    body: string;
  } | null>(null);

  function generate() {
    startTransition(async () => {
      const res = await generateFollowUpEmailAction(applicationId);
      if (res.success) {
        setResult(res.data);
        setOpen(true);
      } else {
        toast.error(res.error);
      }
    });
  }

  function copy() {
    if (!result) return;
    void navigator.clipboard
      .writeText(`${result.subject}\n\n${result.body}`)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Could not copy"));
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={generate} disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        AI follow-up
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>AI follow-up email</DialogTitle>
            <DialogDescription>
              Drafted from your application details. Edit and send it yourself.
            </DialogDescription>
          </DialogHeader>
          {result && (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="text-sm font-medium">{result.subject}</p>
              </div>
              <pre className="max-h-80 overflow-auto rounded-lg border p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {result.body}
              </pre>
              <Button variant="outline" size="sm" onClick={copy}>
                <Copy className="size-4" />
                Copy
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}