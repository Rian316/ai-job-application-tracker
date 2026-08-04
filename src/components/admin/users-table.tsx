"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  updateUserRoleAction,
  deleteUserAction,
} from "@/actions/admin";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
  _count: { applications: number };
};

export function AdminUsersTable({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  function toggleRole(user: AdminUserRow) {
    const role = user.role === "ADMIN" ? "USER" : "ADMIN";
    setPendingId(user.id);
    void updateUserRoleAction(user.id, role as "USER" | "ADMIN").then((result) => {
      setPendingId(null);
      if (result.success) {
        toast.success(`Role updated to ${role}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function remove(user: AdminUserRow) {
    setPendingId(user.id);
    void deleteUserAction(user.id).then((result) => {
      setPendingId(null);
      if (result.success) {
        toast.success("User deleted");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Applications</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <p className="font-medium">{user.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </TableCell>
              <TableCell>
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>{user._count.applications}</TableCell>
              <TableCell className="text-muted-foreground">
                {format(user.createdAt, "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRole(user)}
                    disabled={pendingId === user.id}
                    title={user.role === "ADMIN" ? "Revoke admin" : "Make admin"}
                  >
                    {pendingId === user.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : user.role === "ADMIN" ? (
                      <ShieldCheck className="size-3.5" />
                    ) : (
                      <Shield className="size-3.5" />
                    )}
                    {user.role === "ADMIN" ? "Demote" : "Promote"}
                  </Button>
                  {user.id !== currentUserId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete user?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently removes {user.email} and all their
                            data. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => remove(user)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}