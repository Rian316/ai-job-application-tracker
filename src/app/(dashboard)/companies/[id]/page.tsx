import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Briefcase,
  Building2,
  ExternalLink,
  Globe,
  MapPin,
  Star,
  Users,
} from "lucide-react";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CompanyForm } from "@/components/companies/company-form";
import { DeleteCompanyButton } from "@/components/companies/delete-company-button";
import { statusConfig } from "@/lib/status";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id!;

  const [company, applications] = await Promise.all([
    db.company.findFirst({ where: { id, userId } }),
    db.application.findMany({
      where: { companyId: id, userId },
      orderBy: { applicationDate: "desc" },
      select: {
        id: true,
        position: true,
        status: true,
        applicationDate: true,
      },
    }),
  ]);

  if (!company) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Building2 className="size-6 text-muted-foreground" />
            {company.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {company.industry && <Badge variant="secondary">{company.industry}</Badge>}
            {company.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {company.location}
              </span>
            )}
            {company.size && (
              <span className="flex items-center gap-1">
                <Users className="size-3.5" />
                {company.size}
              </span>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                <Globe className="size-3.5" />
                Website
                <ExternalLink className="size-3" />
              </a>
            )}
            {company.glassdoorRating != null && (
              <span className="flex items-center gap-1">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {Number(company.glassdoorRating).toFixed(1)} on Glassdoor
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DeleteCompanyButton id={company.id} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Applications at {company.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No applications tracked for this company yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {applications.map((app) => (
                    <Link
                      key={app.id}
                      href={`/applications/${app.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Briefcase className="size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{app.position}</p>
                          <p className="text-xs text-muted-foreground">
                            Applied {app.applicationDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={statusConfig[app.status as keyof typeof statusConfig]?.className}
                      >
                        {statusConfig[app.status as keyof typeof statusConfig]?.label ?? app.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {company.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{company.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Research</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Section label="Salary range">
                {company.salaryRange ? (
                  <p className="text-sm">{company.salaryRange}</p>
                ) : (
                  <Empty />
                )}
              </Section>
              <Separator />
              <Section label="Pros">
                {company.pros ? <p className="whitespace-pre-wrap text-sm">{company.pros}</p> : <Empty />}
              </Section>
              <Separator />
              <Section label="Cons">
                {company.cons ? <p className="whitespace-pre-wrap text-sm">{company.cons}</p> : <Empty />}
              </Section>
              <Separator />
              <Section label="Interview experience">
                {company.interviewExperience ? (
                  <p className="whitespace-pre-wrap text-sm">{company.interviewExperience}</p>
                ) : (
                  <Empty />
                )}
              </Section>
            </CardContent>
          </Card>

          <div className="rounded-lg border bg-card p-4">
            <p className="mb-3 text-sm font-semibold">Edit company info</p>
            <CompanyForm mode="edit" companyId={company.id} initialData={{
              name: company.name,
              industry: company.industry ?? "",
              size: company.size ?? "",
              glassdoorRating: company.glassdoorRating != null ? String(company.glassdoorRating) : "",
              website: company.website ?? "",
              location: company.location ?? "",
              notes: company.notes ?? "",
              interviewExperience: company.interviewExperience ?? "",
              salaryRange: company.salaryRange ?? "",
              pros: company.pros ?? "",
              cons: company.cons ?? "",
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-muted-foreground/60">Not recorded</p>;
}
