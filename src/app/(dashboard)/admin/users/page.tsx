import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { AdminUsersTable, type AdminUserRow } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { applications: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description={`${users.length} registered users`}
      />
      <AdminUsersTable
        users={users as unknown as AdminUserRow[]}
        currentUserId={currentUserId ?? ""}
      />
    </div>
  );
}