"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md">
      <SidebarTrigger />
      <div className="flex-1" />
      <NotificationsButton />
      <ThemeToggle />
    </header>
  );
}

type Notification = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  status: "UNREAD" | "READ";
};

function NotificationsButton() {
  const { data } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/recent");
      if (!res.ok) return [];
      const json = await res.json();
      return (json.notifications ?? []) as Notification[];
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
          {data?.some((n) => n.status === "UNREAD") && (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {!data || data.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            data.slice(0, 5).map((notification) => (
              <DropdownMenuItem key={notification.id} asChild>
                <Link
                  href={notification.link ?? "#"}
                  className="flex flex-col items-start gap-0.5 p-3"
                >
                  <span className="text-sm font-medium">
                    {notification.title}
                  </span>
                  {notification.body && (
                    <span className="text-xs text-muted-foreground">
                      {notification.body}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="justify-center text-center">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}