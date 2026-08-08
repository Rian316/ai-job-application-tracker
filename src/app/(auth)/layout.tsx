import Link from "next/link";
import { Briefcase, Sparkles, Bot } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <header className="relative z-10 flex items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-emerald-400 text-white">
            <Briefcase className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">JobTrack AI</span>
        </Link>
        <ThemeToggle />
      </header>
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-16">
        {children}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Briefcase className="size-4 text-primary" />
            <span>Track applications</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span>AI-powered insights</span>
          </div>
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-primary" />
            <span>Interview prep</span>
          </div>
        </div>
      </main>
    </div>
  );
}
