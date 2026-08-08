import Link from "next/link";
import { Plus } from "lucide-react";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  KanbanBoard,
  type KanbanCard,
} from "@/components/applications/kanban-board";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const cards = await db.application.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      companyName: true,
      position: true,
      status: true,
      applicationDate: true,
      location: true,
      bookmarked: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kanban"
        description="Drag applications between stages to update their status"
      >
        <Button asChild size="sm">
          <Link href="/applications/new">
            <Plus className="size-4" />
            Add application
          </Link>
        </Button>
      </PageHeader>

      <KanbanBoard cards={cards as unknown as KanbanCard[]} />
    </div>
  );
}
