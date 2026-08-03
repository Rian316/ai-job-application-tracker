import Link from "next/link";
import { Plus } from "lucide-react";

import { auth } from "@/auth";
import { db } from "@/lib/db";
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
          <p className="text-sm text-muted-foreground">
            {applications.length} tracked Â· bookmark, filter and manage every application
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/applications/new">
            <Plus className="size-4" />
            Add application
          </Link>
        </Button>
      </div>

      <ApplicationsTable data={applications as unknown as ApplicationRow[]} />
    </div>
  );
}
