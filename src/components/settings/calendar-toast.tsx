"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function CalendarToast() {
  const searchParams = useSearchParams();
  const calendar = searchParams.get("calendar");

  React.useEffect(() => {
    if (calendar === "connected") {
      toast.success("Google Calendar connected successfully.");
    } else if (calendar === "error") {
      toast.error("Failed to connect Google Calendar. Please try again.");
    }
  }, [calendar]);

  return null;
}
