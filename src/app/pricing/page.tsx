import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing — JobTrack AI",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For getting started with your job search.",
    features: [
      "20 applications tracked",
      "Basic pipeline board",
      "Calendar view",
      "In-app notifications",
      "Community support",
    ],
    cta: "Start free",
    href: "/register",
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For serious job seekers who want an edge.",
    features: [
      "Unlimited applications",
      "AI cover letter generator",
      "AI resume analyzer",
      "AI interview coach",
      "AI follow-up emails",
      "AI assistant chat",
      "Advanced analytics + exports",
      "Google Calendar sync",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    href: "/register",
    highlight: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "per user / month",
    description: "For career coaches and small teams.",
    features: [
      "Everything in Pro",
      "Client/team workspaces",
      "Coach-style reporting",
      "Admin dashboard",
      "Dedicated support",
    ],
    cta: "Contact us",
    href: "/register",
  },
];

export default function PricingPage() {
  return (
    <MarketingShell
      heroTitle="Simple pricing that scales with your search"
      heroDescription="Start free. Upgrade when you want AI superpowers."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn("relative flex flex-col", plan.highlight && "border-primary shadow-lg")}
          >
            {plan.highlight && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <p className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6" variant={plan.highlight ? "default" : "outline"}>
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </MarketingShell>
  );
}