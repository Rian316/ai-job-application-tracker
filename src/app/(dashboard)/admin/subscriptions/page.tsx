import { format } from "date-fns";

import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

const planColors: Record<string, string> = {
  FREE: "bg-muted text-muted-foreground",
  PRO: "bg-primary/10 text-primary",
  TEAM: "bg-violet-500/10 text-violet-500",
};

const statusColors: Record<string, string> = {
  TRIALING: "bg-blue-500/10 text-blue-500",
  ACTIVE: "bg-emerald-500/10 text-emerald-500",
  PAST_DUE: "bg-amber-500/10 text-amber-500",
  CANCELED: "bg-muted text-muted-foreground",
  EXPIRED: "bg-destructive/10 text-destructive",
};

export default async function AdminSubscriptionsPage() {
  const subscriptions = await db.subscription.findMany({
    orderBy: { updatedAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description={`${subscriptions.length} subscriptions`}
      />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Period ends</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>
                  <p className="font-medium">
                    {subscription.user?.name ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {subscription.user?.email}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge className={planColors[subscription.plan] ?? ""}>
                    {subscription.plan}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[subscription.status] ?? ""}>
                    {subscription.status.replaceAll("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {subscription.currentPeriodEnd
                    ? format(subscription.currentPeriodEnd, "MMM d, yyyy")
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(subscription.updatedAt, "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}