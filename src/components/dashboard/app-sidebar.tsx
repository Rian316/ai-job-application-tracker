"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  Briefcase,
  Building2,
  CalendarDays,
  CheckSquare,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  Palette,
  Search,
  Sparkles,
  Users,
  Bookmark,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserMenu, type UserMenuProps } from "@/components/dashboard/user-menu";

const mainNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Applications", href: "/applications", icon: Briefcase },
  { title: "Kanban Board", href: "/kanban", icon: KanbanSquare },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
{ title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Network", href: "/network", icon: Users },
  { title: "Companies", href: "/companies", icon: Building2 },
];

const aiNav = [
  { title: "AI Assistant", href: "/assistant", icon: Sparkles },
  { title: "Cover Letters", href: "/cover-letters", icon: FileText },
  { title: "Resume Library", href: "/resumes", icon: Search },
  { title: "Interview Coach", href: "/interviews", icon: Bot },
];

const libraryNav = [
  { title: "Documents", href: "/documents", icon: Palette },
  { title: "Bookmarks", href: "/bookmarks", icon: Bookmark },
];

export function AppSidebar({ user }: { user: UserMenuProps["user"] }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/dashboard">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-emerald-400 text-white">
                  <Briefcase className="size-4" />
                </div>
                <span className="font-semibold">JobTrack AI</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {libraryNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserMenu user={user} />
      </SidebarFooter>
      <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}