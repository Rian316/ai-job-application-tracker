import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Briefcase,
  CalendarDays,
  FileText,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: FileText,
    title: "AI Cover Letters",
    description:
      "Generate tailored cover letters in seconds from your resume and job description.",
  },
  {
    icon: Bot,
    title: "Resume Analyzer",
    description:
      "Get an ATS score, missing keywords, and bullet-point improvements instantly.",
  },
  {
    icon: Briefcase,
    title: "Pipeline Tracking",
    description:
      "Manage every application from wishlist to offer with a drag-and-drop kanban board.",
  },
  {
    icon: CalendarDays,
    title: "Interview Prep",
    description:
      "Schedule interviews, get reminders, and practice with an AI interview coach.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Understand your response rate, offer rate, and what actually works.",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description:
      "Ask questions like 'which applications need follow-up?' and get answers.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-emerald-400 text-white">
            <Briefcase className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">
            JobTrack AI
          </span>
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
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">
              Get started
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6">
        <section className="flex flex-col items-center pt-24 pb-16 text-center">
          <Badge className="mb-6 rounded-full px-4 py-1.5" variant="secondary">
            <Sparkles className="mr-1.5 size-3.5" />
            AI-powered job search, finally organized
          </Badge>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Land your dream job with{" "}
            <span className="bg-gradient-to-r from-purple-500 via-blue-400 to-emerald-400 bg-clip-text text-transparent">AI on your side</span>
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            Track every application, generate cover letters, analyze your resume,
            and prepare for interviews. JobTrack AI is your complete job search
            command center.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/register">
                Start tracking for free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/features">Explore features</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Free forever plan · No credit card required
          </p>
        </section>

        <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border bg-card/50 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <feature.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="relative z-10 border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} JobTrack AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/blog" className="hover:text-foreground">
              Blog
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
