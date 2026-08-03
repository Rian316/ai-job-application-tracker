"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { statusOrder, statusConfig } from "@/lib/status";
import { updateApplicationStatusAction } from "@/actions/application";

const stepperStatuses = statusOrder.filter((s) =>
  ["WISHLIST", "APPLIED", "PHONE_SCREENING", "TECHNICAL_INTERVIEW", "OFFER", "ACCEPTED", "REJECTED"].includes(s),
);

export function StatusStepper({
  currentStatus,
  applicationId,
}: {
  currentStatus: string;
  applicationId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const currentIndex = stepperStatuses.indexOf(currentStatus as never);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  function handleJump(status: string) {
    if (status === currentStatus || isPending) return;
    startTransition(async () => {
      const result = await updateApplicationStatusAction(applicationId, status as never);
      if (result.success) {
        toast.success(`Status updated to ${statusConfig[status as keyof typeof statusConfig].label}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {stepperStatuses.map((status, i) => {
        const config = statusConfig[status];
        const reached = i <= activeIndex;
        return (
          <React.Fragment key={status}>
            {i > 0 && (
              <div
                className={cn(
                  "h-px min-w-4 flex-1",
                  reached ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => handleJump(status)}
              className={cn(
                "flex h-auto flex-col items-center gap-1 px-2 py-1.5",
                !reached && "opacity-50",
              )}
            >
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2 text-xs",
                  reached
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border",
                )}
              >
                {reached ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className="whitespace-nowrap text-[10px] font-medium">
                {config.label}
              </span>
            </Button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
