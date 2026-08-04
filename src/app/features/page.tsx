import type { Metadata } from "next";
import {
  BarChart3,
  Bell,
  Bot,
  Briefcase,
  Building2,
  CalendarDays,
  FileText,
  KanbanSquare,
  Sparkles,
  Users,
} from "lucide-react";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Features — JobTrack AI",
};

const features = [
  {
    icon: KanbanSquare,
    title: "Pipeline tracking",
    description:
      "Track every application from wishlist to offer with a drag-and-drop kanban board and detailed statuses.",
  },
  {
    icon: Sparkles,
    title: "AI cover letters",
    description:
      "Generate tailored cover letters in seconds from your resume and the job description. Choose the tone.",
  },
  {
    icon: Bot,
    title: "Resume analyzer",
    description:
      "Get an instant ATS score with strengths, weaknesses and concrete improvements for every resume version.",
  },
  {
    icon: Bot,
    title: "Interview coach",
    description:
      "Practice behavioral questions in a mock interview and receive scored, structured feedback.",
  },
  {
    icon: FileText,
    title: "Follow-up emails",
    description:
      "Never miss a follow-up: AI drafts polite, timely emails for any application with one click.",
  },
  {
    icon: Briefcase,
    title: "AI assistant",
    description:
      "Ask anything about your search — strategy, timing, negotiation — with answers grounded in your data.",
  },
  {
    icon: CalendarDays,
    title: "Calendar & reminders",
    description:
      "Interviews and deadlines in one calendar, with in-app reminders and optional Google Calendar sync.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "In-app and email reminders for interviews, follow-ups and tasks so nothing slips through.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Response rates, offer rates, sources and a 6-month activity heatmap. Export to Excel, PDF or CSV.",
  },
  {
    icon: Users,
    title: "Network",
    description:
      "Track recruiters and hiring managers, note conversations and schedule follow-ups.",
  },
  {
    icon: Building2,
    title: "Company research",
    description: "Build a company database with research notes, interview experiences and pros and cons.",
  },
  {
    icon: Sparkles,
    title: "Weekly reports",
    description:
      "AI summarizes your week's progress and suggests concrete next steps automatically.",
  },
];

export default function FeaturesPage() {
  return (
    <MarketingShell
      heroTitle="Everything you need to land the job"
      heroDescription="Track, analyze and optimize your entire job search in one place — with AI doing the heavy lifting."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <CardTitle className="text-base">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </MarketingShell>
  );
}