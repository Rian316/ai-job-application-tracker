import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { SettingsForms } from "@/components/settings/settings-forms";
import { CalendarToast } from "@/components/settings/calendar-toast";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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
      <CalendarToast />
      <PageHeader
        title="Settings"
        description="Notification preferences, goals and integrations."
      />
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