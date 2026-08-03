"use client";

import * as React from "react";
import Link from "next/link";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CalendarDayEvent = {
  id: string;
  kind: "interview" | "task";
  title: string;
  time: Date;
  location?: string | null;
  meetingUrl?: string | null;
  applicationId?: string | null;
  companyName?: string | null;
  done?: boolean;
};

function getMonthGrid(month: Date) {
  const first = startOfMonth(month);
  const start = startOfWeek(first, { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    days.push(d);
  }
  return days;
}

export function MonthCalendar({ events, month: initialMonth }: { events: CalendarDayEvent[]; month: Date }) {
  const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(initialMonth));
  const [selected, setSelected] = React.useState<Date>(new Date());

  const days = getMonthGrid(currentMonth);
  const byDay = React.useMemo(() => {
    const map = new Map<string, CalendarDayEvent[]>();
    for (const event of events) {
      const key = format(event.time, "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const selectedEvents = byDay.get(format(selected, "yyyy-MM-dd")) ?? [];
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => {
              const now = new Date();
              setCurrentMonth(startOfMonth(now));
              setSelected(now);
            }}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-muted">
        {weekdays.map((day) => (
          <div key={day} className="bg-background px-2 py-1.5 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dayEvents = byDay.get(format(day, "yyyy-MM-dd")) ?? [];
          const inMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selected);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => setSelected(day)}
              className={cn(
                "flex min-h-20 flex-col items-stretch gap-1 bg-background p-1.5 text-left transition-colors hover:bg-accent/50",
                !inMonth && "text-muted-foreground/40",
                isToday && "ring-1 ring-inset ring-primary",
                isSelected && "bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  isToday && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </span>
              <div className="flex flex-col gap-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <span
                    key={event.id}
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-[10px] leading-tight",
                      event.kind === "interview"
                        ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                        : event.done
                          ? "bg-muted text-muted-foreground line-through"
                          : "bg-primary/10 text-primary",
                    )}
                  >
                    {event.kind === "interview" ? "• " : ""}
                    {event.title}
                  </span>
                ))}
                {dayEvents.length > 3 && (
                  <span className="px-1 text-[10px] text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{format(selected, "EEEE, MMMM d")}</h3>
          <Badge variant="secondary">{selectedEvents.length} events</Badge>
        </div>
        {selectedEvents.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No interviews or tasks scheduled for this day.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {selectedEvents
              .sort((a, b) => a.time.getTime() - b.time.getTime())
              .map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium">
                      <span className="text-muted-foreground">{format(event.time, "h:mm a")}</span>{" "}
                      {event.title}
                    </p>
                    <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant="secondary"
                        className={cn(
                          event.kind === "interview" &&
                            "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                        )}
                      >
                        {event.kind === "interview" ? "Interview" : "Task"}
                      </Badge>
                      {event.location && <span>{event.location}</span>}
                      {event.companyName && <span>{event.companyName}</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {event.meetingUrl && (
                      <Button asChild variant="ghost" size="sm">
                        <a href={event.meetingUrl} target="_blank" rel="noreferrer">
                          <Video className="size-3.5" />
                          Join
                        </a>
                      </Button>
                    )}
                    {event.applicationId && (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/applications/${event.applicationId}`}>View</Link>
                      </Button>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}