import Link from "next/link";
import { Building2, Globe, MapPin, Star } from "lucide-react";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyForm } from "@/components/companies/company-form";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const companies = await db.company.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { applications: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground">
            {companies.length} tracked · research notes, interview experience and salary data
          </p>
        </div>
        <CompanyForm mode="create" />
      </div>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <Building2 className="size-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No companies tracked yet</p>
              <p className="text-sm text-muted-foreground">
                Add companies you&apos;re researching or applying to.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link key={company.id} href={`/companies/${company.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{company.name}</p>
                      {company.industry && (
                        <p className="truncate text-sm text-muted-foreground">
                          {company.industry}
                        </p>
                      )}
                    </div>
                    {company.glassdoorRating != null && (
                      <Badge variant="secondary" className="shrink-0">
                        <Star className="mr-1 size-3 fill-amber-400 text-amber-400" />
                        {Number(company.glassdoorRating).toFixed(1)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {company.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {company.location}
                      </span>
                    )}
                    {company.website && (
                      <span className="flex items-center gap-1">
                        <Globe className="size-3" />
                        {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {company._count.applications}{" "}
                    {company._count.applications === 1 ? "application" : "applications"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
