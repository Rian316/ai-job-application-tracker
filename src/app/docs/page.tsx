import type { Metadata } from "next";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Docs — JobTrack AI",
};

const sections = [
  {
    title: "Getting started",
    items: [
      {
        heading: "Create your account",
        body: "Sign up with email or Google/GitHub OAuth at /register. The demo account is demo@example.com (password demo12345).",
      },
      {
        heading: "Add your first application",
        body: "Go to Applications → Add application. Company, position, source and status are required; everything else is optional. Save, then keep the card updated as it moves through your pipeline.",
      },
      {
        heading: "Pick your goals",
        body: "Set weekly and monthly application targets in Settings. The dashboard tracks progress against them.",
      },
    ],
  },
  {
    title: "Managing applications",
    items: [
      {
        heading: "Kanban board",
        body: "The board shows 6 pipeline stages (Wishlist, Applied, Interview, Offer, Rejected, Archived). Drag a card between columns to update its status.",
      },
      {
        heading: "Status stepper",
        body: "On each application detail page, the stepper lets you advance through detailed statuses (e.g. Applied → Resume viewed → Phone screening).",
      },
      {
        heading: "Interviews & tasks",
        body: "Attach interviews (with meeting links) and tasks (with due dates and recurring intervals) to any application. They appear on the Calendar and Tasks pages.",
      },
      {
        heading: "Follow-ups",
        body: "Open an application and click 'AI follow-up' to draft a polite follow-up email based on how long ago you applied.",
      },
    ],
  },
  {
    title: "AI features",
    items: [
      {
        heading: "Cover letters",
        body: "In Cover Letters, click 'Generate cover letter', fill in company, position, job description and pick a resume. The AI drafts a letter you can edit, download or reuse.",
      },
      {
        heading: "Resume analysis",
        body: "Add your resume text in Resume Library, then click 'Analyze with AI' to get an ATS score, strengths, weaknesses and concrete suggestions.",
      },
      {
        heading: "Interview coach",
        body: "The coach walks you through 8 behavioral questions, scores each answer out of 10 and shows how to restructure with STAR.",
      },
      {
        heading: "Assistant",
        body: "Ask strategy questions in the chat. The assistant knows your live stats. Use 'Weekly report' for an AI summary of your week.",
      },
    ],
  },
  {
    title: "Analytics & export",
    items: [
      {
        heading: "Dashboards",
        body: "Analytics shows monthly volume, status breakdown, source performance and a 6-month activity heatmap.",
      },
      {
        heading: "Export",
        body: "Click Export on the Analytics page to download your applications as CSV, Excel or PDF.",
      },
    ],
  },
  {
    title: "Integrations & reminders",
    items: [
      {
        heading: "Google Calendar",
        body: "In Settings → Google Calendar, click Connect and authorize. Then 'Sync interviews' pushes upcoming interviews to your primary calendar.",
      },
      {
        heading: "Notifications",
        body: "Interviews and tasks due within 24 hours generate in-app notifications. The /api/cron/reminders endpoint runs hourly (protect with CRON_SECRET in production).",
      },
    ],
  },
  {
    title: "Troubleshooting",
    items: [
      {
        heading: "AI responses missing",
        body: "Add OPENAI_API_KEY to .env and restart. Without a key the app uses built-in fallback responses so the UI always works.",
      },
      {
        heading: "Emails not sending",
        body: "Set RESEND_API_KEY and EMAIL_FROM in .env. Until then, emails are logged to the server console instead.",
      },
      {
        heading: "Google Calendar shows 'not configured'",
        body: "Fill GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET and GOOGLE_CALENDAR_REDIRECT_URI in .env, then restart.",
      },
    ],
  },
];

export default function DocsPage() {
  return (
    <MarketingShell
      heroTitle="Documentation"
      heroDescription="Everything you need to get the most out of JobTrack AI."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item) => (
                <div key={item.heading} className="space-y-1">
                  <p className="text-sm font-medium">{item.heading}</p>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </MarketingShell>
  );
}