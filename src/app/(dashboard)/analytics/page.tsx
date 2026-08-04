import type { Metadata } from "next";
import {
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";
import { ExportButtons } from "@/components/analytics/export-buttons";

export const metadata: Metadata = {
  title: "Analytics",
};

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const today = new Date();
  const monthStart = startOfMonth(subMonths(today, 5));

  const [applications, heatmapApplications, upcomingInterviews, monthCounts] =
    await Promise.all([
      db.application.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          source: true,
          applicationDate: true,
          companyName: true,
          position: true,
          workMode: true,
          salaryMin: true,
          salaryMax: true,
        },
      }),
      db.application.findMany({
        where: { userId, applicationDate: { gte: subMonths(today, 6) } },
        select: { applicationDate: true },
      }),
      db.interview.count({
        where: { userId, scheduledAt: { gte: today } },
      }),
      db.application.findMany({
        where: { userId, applicationDate: { gte: monthStart } },
        select: { applicationDate: true },
      }),
    ]);

  const total = applications.length;
  const byStatus = new Map<string, number>();
  const bySource = new Map<string, number>();
  const byWorkMode = new Map<string, number>();
  for (const app of applications) {
    byStatus.set(app.status, (byStatus.get(app.status) ?? 0) + 1);
    bySource.set(app.source, (bySource.get(app.source) ?? 0) + 1);
    if (app.workMode)
      byWorkMode.set(app.workMode, (byWorkMode.get(app.workMode) ?? 0) + 1);
  }

  const offers = byStatus.get("OFFER") ?? 0;
  const rejected = byStatus.get("REJECTED") ?? 0;
  const interviewStage = applications.length
    ? applications.filter((a) =>
        ["PHONE_SCREENING", "ASSESSMENT", "TECHNICAL_INTERVIEW", "MANAGER_INTERVIEW", "FINAL_INTERVIEW"].includes(a.status),
      ).length
    : 0;

  const months = eachMonthOfInterval({
    start: monthStart,
    end: today,
  }).map((month) => ({
    month: format(month, "MMM"),
    count: monthCounts.filter(
      (a) =>
        a.applicationDate >= startOfMonth(month) &&
        a.applicationDate <= endOfMonth(month),
    ).length,
  }));

  const heatmapData = buildHeatmap(
    heatmapApplications.map((a) => a.applicationDate),
  );

  const exportRows = applications.map((a) => ({
    "Company": a.companyName,
    "Position": a.position,
    "Status": a.status.replaceAll("_", " ").toLowerCase(),
    "Source": a.source.replaceAll("_", " ").toLowerCase(),
    "Work mode": a.workMode ? a.workMode.toLowerCase() : "",
    "Applied": format(a.applicationDate, "yyyy-MM-dd"),
    "Salary min": a.salaryMin ?? "",
    "Salary max": a.salaryMax ?? "",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description={`${total} tracked applications · ${offers} offers · ${rejected} rejected`}
      >
        <ExportButtons rows={exportRows} />
      </PageHeader>

      <AnalyticsCharts
        stats={{
          total,
          applied: applications.filter((a) => a.applicationDate >= monthStart).length,
          interviewStage,
          upcomingInterviews,
          offers,
          rejected,
          responseRate: total ? Math.round(((offers + interviewStage) / total) * 100) : 0,
          offerRate: total ? Math.round((offers / total) * 100) : 0,
        }}
        monthly={months}
        byStatus={Object.fromEntries(byStatus)}
        bySource={Object.fromEntries(bySource)}
        byWorkMode={Object.fromEntries(byWorkMode)}
        heatmap={heatmapData}
        total={total}
      />
    </div>
  );
}

function buildHeatmap(
  dates: Date[],
): Array<{ date: string; count: number }> {
  const now = new Date();
  const weekStart = startOfWeek(subMonths(now, 6), { weekStartsOn: 1 });
  const counts = new Map<string, number>();
  for (const date of dates) {
    const key = format(date, "yyyy-MM-dd");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const cells: Array<{ date: string; count: number }> = [];
  for (let d = weekStart; d <= endOfWeek(now, { weekStartsOn: 1 }); d.setDate(d.getDate() + 1)) {
    const key = format(d, "yyyy-MM-dd");
    cells.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return cells;
}