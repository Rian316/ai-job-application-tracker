import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

const DEMO_PASSWORD = "demo12345";

const statuses = [
  "WISHLIST",
  "PREPARING",
  "APPLIED",
  "RESUME_VIEWED",
  "PHONE_SCREENING",
  "ASSESSMENT",
  "TECHNICAL_INTERVIEW",
  "MANAGER_INTERVIEW",
  "FINAL_INTERVIEW",
  "OFFER",
  "NEGOTIATION",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
  "ARCHIVED",
] as const;

type Status = (typeof statuses)[number];

const jobs = [
  { company: "Vercel", position: "Senior Frontend Engineer", status: "TECHNICAL_INTERVIEW", source: "WEBSITE", workMode: "REMOTE", salary: [170000, 200000], location: "Remote", priority: "HIGH", daysAgo: 21 },
  { company: "Linear", position: "Product Engineer", status: "PHONE_SCREENING", source: "REFERRAL", workMode: "REMOTE", salary: [180000, 220000], location: "Remote", priority: "URGENT", daysAgo: 9 },
  { company: "Stripe", position: "Backend Engineer", status: "APPLIED", source: "LINKEDIN", workMode: "HYBRID", salary: [190000, 230000], location: "San Francisco, CA", priority: "MEDIUM", daysAgo: 4 },
  { company: "Notion", position: "Full Stack Engineer", status: "OFFER", source: "WEBSITE", workMode: "HYBRID", salary: [165000, 195000], location: "New York, NY", priority: "HIGH", daysAgo: 33 },
  { company: "Datadog", position: "Software Engineer II", status: "REJECTED", source: "INDEED", workMode: "HYBRID", salary: [155000, 185000], location: "Boston, MA", priority: "LOW", daysAgo: 15 },
  { company: "Figma", position: "Design Engineer", status: "ASSESSMENT", source: "LINKEDIN", workMode: "ONSITE", salary: [160000, 200000], location: "San Francisco, CA", priority: "MEDIUM", daysAgo: 12 },
  { company: "Supabase", position: "Platform Engineer", status: "WISHLIST", source: "WEBSITE", workMode: "REMOTE", salary: [150000, 185000], location: "Remote", priority: "LOW", daysAgo: 2 },
  { company: "Cursor (Anysphere)", position: "AI Engineer", status: "MANAGER_INTERVIEW", source: "RECRUITER", workMode: "ONSITE", salary: [200000, 260000], location: "San Francisco, CA", priority: "URGENT", daysAgo: 26 },
  { company: "Shopify", position: "Staff Developer", status: "ACCEPTED", source: "REFERRAL", workMode: "REMOTE", salary: [185000, 225000], location: "Remote", priority: "HIGH", daysAgo: 48 },
  { company: "Airbnb", position: "Senior Software Engineer", status: "WITHDRAWN", source: "LINKEDIN", workMode: "HYBRID", salary: [180000, 215000], location: "Seattle, WA", priority: "LOW", daysAgo: 40 },
  { company: "GitHub", position: "Solutions Engineer", status: "FINAL_INTERVIEW", source: "GLASSDOOR", workMode: "REMOTE", salary: [140000, 170000], location: "Remote", priority: "HIGH", daysAgo: 31 },
  { company: "Monzo", position: "Backend Engineer", status: "RESUME_VIEWED", source: "WEBSITE", workMode: "HYBRID", salary: [90000, 120000], location: "London, UK", priority: "MEDIUM", daysAgo: 6 },
  { company: "Grafana Labs", position: "Software Engineer - Frontend", status: "NEGOTIATION", source: "REFERRAL", workMode: "REMOTE", salary: [155000, 190000], location: "Remote", priority: "URGENT", daysAgo: 37 },
  { company: "PlanetScale", position: "Distributed Systems Engineer", status: "ARCHIVED", source: "OTHER", workMode: "REMOTE", salary: [165000, 200000], location: "Remote", priority: "LOW", daysAgo: 60 },
  { company: "Raycast", position: "Product Engineer", status: "PREPARING", source: "WEBSITE", workMode: "HYBRID", salary: [130000, 160000], location: "London, UK", priority: "MEDIUM", daysAgo: 3 },
  { company: "Hashicorp", position: "Go Engineer", status: "REJECTED", source: "LINKEDIN", workMode: "REMOTE", salary: [160000, 190000], location: "Remote", priority: "LOW", daysAgo: 28 },
  { company: "Mux", position: "Video Engineer", status: "PHONE_SCREENING", source: "RECRUITER", workMode: "REMOTE", salary: [150000, 185000], location: "Remote", priority: "MEDIUM", daysAgo: 11 },
  { company: "Anthropic", position: "AI Safety Engineer", status: "WISHLIST", source: "WEBSITE", workMode: "ONSITE", salary: [220000, 300000], location: "San Francisco, CA", priority: "HIGH", daysAgo: 1 },
  { company: "Cloudflare", position: "Network Engineer", status: "APPLIED", source: "GLASSDOOR", workMode: "HYBRID", salary: [145000, 175000], location: "Austin, TX", priority: "LOW", daysAgo: 5 },
  { company: "Ramp", position: "Full Stack Engineer", status: "ASSESSMENT", source: "REFERRAL", workMode: "ONSITE", salary: [170000, 210000], location: "New York, NY", priority: "HIGH", daysAgo: 14 },
];

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

async function main() {
  console.log("Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Admin",
      role: "ADMIN",
      password: await hash(DEMO_PASSWORD, 12),
      emailVerified: new Date(),
    },
  });
  console.log(`Admin: ${admin.email} / ${DEMO_PASSWORD}`);

  const demoEmail = "demo@example.com";
  const demo = await db.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "Demo User",
      password: await hash(DEMO_PASSWORD, 12),
      emailVerified: new Date(),
    },
  });
  console.log(`Demo user: ${demo.email} / ${DEMO_PASSWORD}`);

  await db.$transaction(async (tx) => {
    await tx.application.deleteMany({ where: { userId: demo.id } });
    await tx.company.deleteMany({ where: { userId: demo.id } });
    await tx.interview.deleteMany({ where: { userId: demo.id } });
    await tx.task.deleteMany({ where: { userId: demo.id } });
    await tx.notification.deleteMany({ where: { userId: demo.id } });
    await tx.resume.deleteMany({ where: { userId: demo.id } });
    await tx.coverLetter.deleteMany({ where: { userId: demo.id } });
    await tx.recruiter.deleteMany({ where: { userId: demo.id } });
    await tx.activityLog.deleteMany({ where: { userId: demo.id } });
    await tx.settings.deleteMany({ where: { userId: demo.id } });
    await tx.userGoal.deleteMany({ where: { userId: demo.id } });
  });

  await db.settings.create({
    data: {
      userId: demo.id,
      weeklyGoal: 5,
      monthlyGoal: 20,
    },
  });

  await db.userGoal.create({
    data: {
      userId: demo.id,
      weeklyApplications: 5,
      monthlyApplications: 20,
      targetRole: "Senior Software Engineer",
    },
  });

  const resume = await db.resume.create({
    data: {
      userId: demo.id,
      name: "Resume v3 - Senior SWE",
      isPrimary: true,
      version: 3,
      atsScore: 82,
      content: "Senior Software Engineer with 7 years of experience...",
    },
  });

  const coverLetter = await db.coverLetter.create({
    data: {
      userId: demo.id,
      name: "Vercel Cover Letter",
      company: "Vercel",
      position: "Senior Frontend Engineer",
      content:
        "Dear Hiring Team,\n\nI'm excited to apply for the Senior Frontend Engineer role at Vercel...",
    },
  });

  const companies = new Map<string, string>();

  for (const job of jobs) {
    const company = await db.company.upsert({
      where: {
        userId_name: { userId: demo.id, name: job.company },
      },
      update: {},
      create: {
        userId: demo.id,
        name: job.company,
        industry: "Software",
        location: job.location,
        notes: "",
      },
    });
    companies.set(job.company, company.id);

    await db.application.create({
      data: {
        userId: demo.id,
        companyId: company.id,
        companyName: job.company,
        position: job.position,
        status: job.status as Status,
        source: job.source as "WEBSITE",
        workMode: job.workMode as "REMOTE",
        salaryMin: job.salary[0],
        salaryMax: job.salary[1],
        location: job.location,
        priority: job.priority as "MEDIUM",
        applicationDate: daysAgo(job.daysAgo),
        notes: "",
        resumeId: resume.id,
        coverLetterId: job.company === "Vercel" ? coverLetter.id : undefined,
      },
    });
  }

  const vercelApp = await db.application.findFirst({
    where: { userId: demo.id, companyName: "Vercel" },
  });

  if (vercelApp) {
    await db.interview.create({
      data: {
        userId: demo.id,
        applicationId: vercelApp.id,
        title: "Technical Interview - Frontend",
        type: "TECHNICAL",
        scheduledAt: daysFromNow(3),
        duration: 60,
        location: "Remote (Zoom)",
        notes: "System design + React deep dive",
      },
    });

    await db.interview.create({
      data: {
        userId: demo.id,
        applicationId: vercelApp.id,
        title: "Manager Interview",
        type: "MANAGER",
        scheduledAt: daysFromNow(6),
        duration: 45,
        location: "Remote (Meet)",
      },
    });

    await db.task.create({
      data: {
        userId: demo.id,
        applicationId: vercelApp.id,
        title: "Follow up after technical interview",
        type: "FOLLOW_UP",
        priority: "HIGH",
        dueAt: daysFromNow(4),
      },
    });
  }

  const cursorApp = await db.application.findFirst({
    where: { userId: demo.id, companyName: "Cursor (Anysphere)" },
  });

  if (cursorApp) {
    await db.interview.create({
      data: {
        userId: demo.id,
        applicationId: cursorApp.id,
        title: "Final Round - Onsite",
        type: "FINAL",
        scheduledAt: daysFromNow(1),
        duration: 240,
        location: "San Francisco HQ",
      },
    });
  }

  await db.task.createMany({
    data: [
      {
        userId: demo.id,
        title: "Update resume with recent achievements",
        type: "RESUME_UPDATE",
        priority: "MEDIUM",
        dueAt: daysFromNow(5),
      },
      {
        userId: demo.id,
        title: "Prep for Cursor onsite interview",
        type: "INTERVIEW_PREP",
        priority: "URGENT",
        dueAt: daysFromNow(1),
      },
      {
        userId: demo.id,
        title: "Send thank you note to Stripe recruiter",
        type: "NETWORKING",
        priority: "LOW",
        dueAt: daysFromNow(2),
      },
    ],
  });

  await db.notification.createMany({
    data: [
      {
        userId: demo.id,
        type: "INTERVIEW_REMINDER",
        title: "Interview tomorrow: Cursor Final Round",
        body: "Don't forget your onsite interview at 10:00 AM.",
      },
      {
        userId: demo.id,
        type: "FOLLOW_UP_REMINDER",
        title: "Follow up with Vercel",
        body: "It's been 4 days since your technical interview.",
      },
    ],
  });

  await db.recruiter.create({
    data: {
      userId: demo.id,
      name: "Sarah Johnson",
      email: "sarah.j@vercel.com",
      companyId: companies.get("Vercel"),
      position: "Technical Recruiter",
      contactType: "RECRUITER",
      linkedinUrl: "https://linkedin.com/in/sarahjohnson",
      lastContact: daysAgo(4),
    },
  });

  await db.recruiter.create({
    data: {
      userId: demo.id,
      name: "Mike Chen",
      companyId: companies.get("Stripe"),
      position: "Hiring Manager",
      contactType: "HIRING_MANAGER",
      linkedinUrl: "https://linkedin.com/in/mikechen",
    },
  });

  await db.activityLog.createMany({
    data: [
      {
        userId: demo.id,
        type: "STATUS_CHANGED",
        message: "Vercel application moved to Technical Interview",
      },
      {
        userId: demo.id,
        type: "AI_GENERATION",
        message: "Generated cover letter for Vercel",
      },
      {
        userId: demo.id,
        type: "INTERVIEW_SCHEDULED",
        message: "Scheduled Cursor final interview",
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
