"use client";

import * as React from "react";
import { format, parseISO, startOfWeek } from "date-fns";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  WISHLIST: "Wishlist",
  PREPARING: "Preparing",
  APPLIED: "Applied",
  RESUME_VIEWED: "Resume viewed",
  PHONE_SCREENING: "Phone screening",
  ASSESSMENT: "Assessment",
  TECHNICAL_INTERVIEW: "Technical interview",
  MANAGER_INTERVIEW: "Manager interview",
  FINAL_INTERVIEW: "Final interview",
  OFFER: "Offer",
  NEGOTIATION: "Negotiation",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  ARCHIVED: "Archived",
};

const sourceLabels: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  INDEED: "Indeed",
  GLASSDOOR: "Glassdoor",
  REFERRAL: "Referral",
  WEBSITE: "Website",
  RECRUITER: "Recruiter",
  OTHER: "Other",
};

const workModeLabels: Record<string, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "Onsite",
};

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
];

type Stats = {
  total: number;
  applied: number;
  interviewStage: number;
  upcomingInterviews: number;
  offers: number;
  rejected: number;
  responseRate: number;
  offerRate: number;
};

export function AnalyticsCharts({
  stats,
  monthly,
  byStatus,
  bySource,
  byWorkMode,
  heatmap,
  total,
}: {
  stats: Stats;
  monthly: Array<{ month: string; count: number }>;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  byWorkMode: Record<string, number>;
  heatmap: Array<{ date: string; count: number }>;
  total: number;
}) {
  const statusData = Object.entries(byStatus)
    .map(([key, value]) => ({
      name: statusLabels[key] ?? key,
      value,
      color: PIE_COLORS[Object.keys(byStatus).indexOf(key) % PIE_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  const sourceData = Object.entries(bySource)
    .map(([key, value]) => ({
      name: sourceLabels[key] ?? key,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const workModeData = Object.entries(byWorkMode)
    .map(([key, value]) => ({
      name: workModeLabels[key] ?? key,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const monthlyConfig = {
    count: { label: "Applications", color: "var(--chart-1)" },
  } satisfies ChartConfig;

  const weekly = buildWeeks(heatmap);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total applications" value={total} />
        <StatCard label="Applied (30d)" value={stats.applied} />
        <StatCard label="Response rate" value={`${stats.responseRate}%`} />
        <StatCard label="Offer rate" value={`${stats.offerRate}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Applications per month</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyConfig} className="h-64">
              <BarChart data={monthly}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={30}
                />
                <Tooltip content={<ChartTooltipContent />} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status breakdown</CardTitle>
            <CardDescription>Where your applications stand</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <EmptyChart />
            ) : (
              <div className="flex items-center gap-4">
                <div className="h-40 w-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="min-w-0 flex-1 space-y-1.5">
                  {statusData.slice(0, 7).map((entry) => (
                    <li key={entry.name} className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="truncate">{entry.name}</span>
                      </span>
                      <span className="text-muted-foreground">{entry.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sources</CardTitle>
            <CardDescription>Where applications come from</CardDescription>
          </CardHeader>
          <CardContent>
            {sourceData.length === 0 ? (
              <EmptyChart />
            ) : (
              <div className="space-y-2">
                {sourceData.map((entry) => (
                  <SourceBar
                    key={entry.name}
                    label={entry.name}
                    value={entry.value}
                    total={total}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work mode preference</CardTitle>
            <CardDescription>Remote vs hybrid vs onsite</CardDescription>
          </CardHeader>
          <CardContent>
            {workModeData.length === 0 ? (
              <EmptyChart />
            ) : (
              <div className="space-y-2">
                {workModeData.map((entry) => (
                  <SourceBar
                    key={entry.name}
                    label={entry.name}
                    value={entry.value}
                    total={total}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application heatmap</CardTitle>
          <CardDescription>Last 6 months of activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Heatmap weeks={weekly} />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function SourceBar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {value} ({pct}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
      Not enough data yet
    </div>
  );
}

function buildWeeks(cells: Array<{ date: string; count: number }>) {
  const max = Math.max(1, ...cells.map((c) => c.count));

  const weeks: Array<{ key: string; days: Array<{ date: string; count: number; level: number }> }> = [];
  let currentWeek: { key: string; days: Array<{ date: string; count: number; level: number }> } | null = null;

  for (const cell of cells) {
    const date = parseISO(cell.date);
    const weekKey = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
    if (!currentWeek || currentWeek.key !== weekKey) {
      currentWeek = { key: weekKey, days: [] };
      weeks.push(currentWeek);
    }
    currentWeek.days.push({
      date: cell.date,
      count: cell.count,
      level: cell.count === 0 ? 0 : Math.min(4, Math.ceil((cell.count / max) * 4)),
    });
  }
  return weeks;
}

function Heatmap({
  weeks,
}: {
  weeks: Array<{ key: string; days: Array<{ date: string; count: number; level: number }> }>;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week) => (
          <div key={week.key} className="flex flex-col gap-1">
            {week.days.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} application${day.count === 1 ? "" : "s"}`}
                className={cn(
                  "size-3 rounded-[3px]",
                  day.level === 0 && "bg-muted",
                  day.level === 1 && "bg-primary/25",
                  day.level === 2 && "bg-primary/50",
                  day.level === 3 && "bg-primary/75",
                  day.level === 4 && "bg-primary",
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        Less
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={cn(
              "size-3 rounded-[3px]",
              level === 0 && "bg-muted",
              level === 1 && "bg-primary/25",
              level === 2 && "bg-primary/50",
              level === 3 && "bg-primary/75",
              level === 4 && "bg-primary",
            )}
          />
        ))}
        More
      </div>
    </div>
  );
}