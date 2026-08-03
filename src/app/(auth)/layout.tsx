import Link from "next/link";
import { Briefcase } from "lucide-react";

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
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        {children}
      </main>
    </div>
  );
}
