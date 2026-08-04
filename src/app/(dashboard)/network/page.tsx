import type { Metadata } from "next";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import {
  NetworkContacts,
  type ContactRow,
} from "@/components/network/network-contacts";

export const metadata: Metadata = {
  title: "Network",
};

export const dynamic = "force-dynamic";

export default async function NetworkPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const contacts = await db.recruiter.findMany({
    where: { userId },
    orderBy: [{ followUpAt: "asc" }, { createdAt: "desc" }],
    include: { company: { select: { id: true, name: true } } },
  });

  const upcomingFollowUps = contacts.filter(
    (c) => c.followUpAt && c.followUpAt >= new Date(),
  ).length;
  const overdueFollowUps = contacts.filter(
    (c) => c.followUpAt && c.followUpAt < new Date(),
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network"
        description={`${contacts.length} contacts · ${upcomingFollowUps} upcoming · ${overdueFollowUps} overdue follow-ups`}
      />
      <NetworkContacts contacts={contacts as unknown as ContactRow[]} />
    </div>
  );
}