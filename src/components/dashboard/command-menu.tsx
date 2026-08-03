"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Bot,
  Briefcase,
  Building2,
  CalendarDays,
  CheckSquare,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  Users,
  Command as CommandIcon,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const navigation = [
  { group: "Workspace", items: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Applications", href: "/applications", icon: Briefcase },
    { title: "Kanban Board", href: "/kanban", icon: KanbanSquare },
    { title: "Calendar", href: "/calendar", icon: CalendarDays },
    { title: "Analytics", href: "/analytics", icon: BarChart3 },
    { title: "Tasks", href: "/tasks", icon: CheckSquare },
    { title: "Network", href: "/network", icon: Users },
    { title: "Companies", href: "/companies", icon: Building2 },
    { title: "Notifications", href: "/notifications", icon: Bell },
    { title: "Settings", href: "/settings", icon: Settings },
  ]},
  { group: "AI Tools", items: [
    { title: "AI Assistant", href: "/assistant", icon: Sparkles },
    { title: "Cover Letters", href: "/cover-letters", icon: FileText },
    { title: "Interview Coach", href: "/interviews", icon: Bot },
  ]},
];

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "/" && !(e.metaKey || e.ctrlKey) && !isEditableTarget(e)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  function onSelect(path: string) {
    setOpen(false);
    router.push(path);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative inline-flex h-8 w-full max-w-xs items-center gap-2 rounded-lg border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="size-4" />
        <span>Search or jump to...</span>
        <kbd className="pointer-events-none absolute right-2 inline-flex h-5 items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px]">
          <CommandIcon className="size-3" />
          K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {navigation.map((section) => (
            <React.Fragment key={section.group}>
              <CommandGroup heading={section.group}>
                {section.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    onSelect={() => onSelect(item.href)}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

function isEditableTarget(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null;
  if (!target) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}