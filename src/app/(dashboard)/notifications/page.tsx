import type { Metadata } from "next";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import {
  NotificationsList,
  type NotificationRow,
} from "@/components/notifications/notifications-list";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const notifications = (await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 200,
  })) as unknown as NotificationRow[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Task, interview and follow-up reminders."
      />
      <NotificationsList notifications={notifications} />
    </div>
  );
}