import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { SettingsForms } from "@/components/settings/settings-forms";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ calendar?: string }>;
}) {
  const { calendar } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const [settings, goals, integration] = await Promise.all([
    db.settings.findUnique({ where: { userId } }),
    db.userGoal.findUnique({ where: { userId } }),
    db.integration.findFirst({
      where: { userId, provider: "google_calendar" },
      select: { connected: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Notification preferences, goals and integrations."
      />
      {calendar && (
        <div
          className={
            calendar === "connected"
              ? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400"
              : "rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          }
        >
          {calendar === "connected"
            ? "Google Calendar connected successfully."
            : "Failed to connect Google Calendar. Please try again."}
        </div>
      )}
      <SettingsForms
        settings={
          settings
            ? {
                emailNotifications: settings.emailNotifications,
                browserNotifications: settings.browserNotifications,
                weeklySummary: settings.weeklySummary,
                weeklySummaryDay: settings.weeklySummaryDay,
                timezone: settings.timezone,
              }
            : null
        }
        goals={
          goals
            ? {
                weeklyApplications: goals.weeklyApplications,
                monthlyApplications: goals.monthlyApplications,
                targetRole: goals.targetRole,
                targetCompany: goals.targetCompany,
              }
            : null
        }
        calendarConnected={integration?.connected ?? false}
      />
    </div>
  );
}