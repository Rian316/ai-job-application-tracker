import Link from "next/link";
import { Plus } from "lucide-react";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  ApplicationsTable,
  type ApplicationRow,
} from "@/components/applications/applications-table";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const applications = await db.application.findMany({
    where: { userId },
    orderBy: [{ bookmarked: "desc" }, { applicationDate: "desc" }],
    select: {
      id: true,
      companyName: true,
      position: true,
      status: true,
      priority: true,
      source: true,
      applicationDate: true,
      bookmarked: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description={`${applications.length} tracked · bookmark, filter and manage every application`}
      >
        <Button asChild size="sm">
          <Link href="/applications/new">
            <Plus className="size-4" />
            Add application
          </Link>
        </Button>
      </PageHeader>

      <ApplicationsTable data={applications as unknown as ApplicationRow[]} />
    </div>
  );
}
