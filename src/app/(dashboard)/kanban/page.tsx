import Link from "next/link";
import { Plus } from "lucide-react";

import { auth } from "@/auth";
import { db } from "@/lib/db";
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kanban</h1>
          <p className="text-sm text-muted-foreground">
            Drag applications between stages to update their status
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/applications/new">
            <Plus className="size-4" />
            Add application
          </Link>
        </Button>
      </div>

      <KanbanBoard cards={cards as unknown as KanbanCard[]} />
    </div>
  );
}
