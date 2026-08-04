import Link from "next/link";
import { Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function MarketingShell({
  children,
  heroTitle,
  heroDescription,
}: {
  children: React.ReactNode;
  heroTitle: string;
  heroDescription: string;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-emerald-400 text-white">
              <Briefcase className="size-4" />
            </div>
            <span className="font-semibold tracking-tight">JobTrack AI</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/features" className="transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="/docs" className="transition-colors hover:text-foreground">
              Docs
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild size="sm" variant="outline">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight">{heroTitle}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{heroDescription}</p>
        </div>
        <div className="mt-12">{children}</div>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <p>© 2026 JobTrack AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/features" className="hover:text-foreground">Features</Link>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/docs" className="hover:text-foreground">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}