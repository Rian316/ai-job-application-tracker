"use client";

import * as React from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bookmark, Building2, GripVertical, MapPin } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { kanbanColumns, statusConfig } from "@/lib/status";
import { updateApplicationStatusAction } from "@/actions/application";

const columnStatusMap: Record<string, string> = {
  WISHLIST: "WISHLIST",
  APPLIED: "APPLIED",
  INTERVIEW: "PHONE_SCREENING",
  OFFER: "OFFER",
  REJECTED: "REJECTED",
  ARCHIVED: "ARCHIVED",
};

export type KanbanCard = {
  id: string;
  companyName: string;
  position: string;
  status: string;
  applicationDate: Date;
  location: string | null;
  bookmarked: boolean;
};

export function KanbanBoard({ cards }: { cards: KanbanCard[] }) {
  const router = useRouter();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const cardsByColumn = React.useMemo(() => {
    const grouped: Record<string, KanbanCard[]> = {};
    for (const col of kanbanColumns) {
      grouped[col.status] = cards.filter((card) => {
        const colStatuses = statusesForColumn(col.status);
        return colStatuses.includes(card.status);
      });
    }
    return grouped;
  }, [cards]);

  const activeCard = activeId
    ? cards.find((card) => card.id === activeId)
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const card = cards.find((c) => c.id === String(active.id));
    if (!card) return;

    const targetColumn = String(over.id);
    const newStatus = columnStatusMap[targetColumn];
    if (!newStatus || newStatus === card.status) return;

    startTransition(async () => {
      const result = await updateApplicationStatusAction(card.id, newStatus as never);
      if (result.success) {
        toast.success(`Moved to ${statusConfig[newStatus as keyof typeof statusConfig].label}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid gap-4 overflow-x-auto pb-4 md:grid-cols-2 xl:grid-cols-6">
        {kanbanColumns.map((column) => {
          const colCards = cardsByColumn[column.status] ?? [];
          return (
            <div
              key={column.status}
              className="flex min-h-64 min-w-[280px] flex-col rounded-lg border bg-muted/40"
            >
              <div className="flex items-center justify-between gap-2 border-b bg-card px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", column.color)} />
                  <span className="text-sm font-semibold">{column.label}</span>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                  {colCards.length}
                </span>
              </div>
              <SortableContext
                items={colCards.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 space-y-2 p-2">
                  {colCards.map((card) => (
                    <SortableCard key={card.id} card={card} disabled={isPending} />
                  ))}
                  {colCards.length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                      Drop here
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
      <DragOverlay>
        {activeCard ? <DraggedCard card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function statusesForColumn(column: string): string[] {
  switch (column) {
    case "WISHLIST":
      return ["WISHLIST", "PREPARING"];
    case "APPLIED":
      return ["APPLIED", "RESUME_VIEWED"];
    case "INTERVIEW":
      return [
        "PHONE_SCREENING",
        "ASSESSMENT",
        "TECHNICAL_INTERVIEW",
        "MANAGER_INTERVIEW",
        "FINAL_INTERVIEW",
      ];
    case "OFFER":
      return ["OFFER", "NEGOTIATION", "ACCEPTED"];
    case "REJECTED":
      return ["REJECTED", "WITHDRAWN"];
    case "ARCHIVED":
      return ["ARCHIVED"];
    default:
      return [];
  }
}

function SortableCard({
  card,
  disabled,
}: {
  card: KanbanCard;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab touch-none rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow",
        isDragging && "opacity-50",
      )}
    >
      <KanbanCardInner card={card} />
    </div>
  );
}

function DraggedCard({ card }: { card: KanbanCard }) {
  return (
    <div className="w-64 rotate-2 cursor-grabbing rounded-md border bg-card p-3 shadow-xl">
      <KanbanCardInner card={card} />
    </div>
  );
}

function KanbanCardInner({ card }: { card: KanbanCard }) {
  const status = statusConfig[card.status as keyof typeof statusConfig];
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/applications/${card.id}`}
          onClick={(e) => e.stopPropagation()}
          className="line-clamp-2 text-sm font-medium hover:underline"
        >
          {card.position}
        </Link>
        {card.bookmarked && (
          <Bookmark className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
        )}
      </div>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Building2 className="size-3" />
        {card.companyName}
      </p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="size-3" />
          {card.location ?? "â€”"}
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className={status?.className}>
            {status?.label}
          </Badge>
          <GripVertical className="size-3 text-muted-foreground/50" />
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Applied {format(card.applicationDate, "MMM d")}
      </p>
    </div>
  );
}
