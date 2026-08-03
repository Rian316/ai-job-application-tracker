import { z } from "zod";

export const applicationStatuses = [
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

export const applicationSources = [
  "LINKEDIN",
  "INDEED",
  "GLASSDOOR",
  "REFERRAL",
  "WEBSITE",
  "RECRUITER",
  "OTHER",
] as const;

export const workModes = ["REMOTE", "HYBRID", "ONSITE"] as const;

export const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const optionalNumberString = (maxLength = 20) =>
  z
    .string()
    .max(maxLength)
    .refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0), "Must be a positive number")
    .optional()
    .or(z.literal(""));

export const applicationSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(120, "Company name must be at most 120 characters"),
  position: z
    .string()
    .min(1, "Position is required")
    .max(160, "Position must be at most 160 characters"),
  jobDescription: z.string().max(20000, "Job description too long").optional().or(z.literal("")),
  jobUrl: z
    .string()
    .url("Must be a valid URL")
    .max(500)
    .optional()
    .or(z.literal("")),
  salaryMin: optionalNumberString(),
  salaryMax: optionalNumberString(),
  currency: z.string().max(8),
  location: z.string().max(200).optional().or(z.literal("")),
  workMode: z.enum(workModes).optional(),
  source: z.enum(applicationSources),
  applicationDate: z.string().min(1, "Application date is required"),
  status: z.enum(applicationStatuses),
  priority: z.enum(priorities),
  notes: z.string().max(20000).optional().or(z.literal("")),
  companyId: z.string().optional().nullable(),
  resumeId: z.string().optional().nullable(),
  coverLetterId: z.string().optional().nullable(),
  expectedSalary: optionalNumberString(),
  rejectionReason: z.string().max(2000).optional().or(z.literal("")),
  offerDetails: z.string().max(2000).optional().or(z.literal("")),
  benefits: z.string().max(2000).optional().or(z.literal("")),
});

export const applicationStatusUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(applicationStatuses),
});

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required").max(120),
  industry: z.string().max(80).optional().or(z.literal("")),
  size: z.string().max(80).optional().or(z.literal("")),
  glassdoorRating: z
    .string()
    .max(10)
    .refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 5), "Must be a rating between 0 and 5")
    .optional()
    .or(z.literal("")),
  website: z.string().url("Must be a valid URL").max(500).optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(20000).optional().or(z.literal("")),
  interviewExperience: z.string().max(20000).optional().or(z.literal("")),
  salaryRange: z.string().max(200).optional().or(z.literal("")),
  pros: z.string().max(2000).optional().or(z.literal("")),
  cons: z.string().max(2000).optional().or(z.literal("")),
});

export const interviewSchema = z.object({
  applicationId: z.string().min(1),
  title: z.string().max(160).optional().or(z.literal("")),
  type: z.enum(["PHONE", "VIDEO", "ONSITE", "TECHNICAL", "BEHAVIORAL", "MANAGER", "PANEL", "FINAL", "OTHER"]),
  scheduledAt: z.string().min(1, "Scheduled date is required"),
  duration: z
    .string()
    .min(1)
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 5 && Number(v) <= 600, "Must be 5–600 minutes"),
  location: z.string().max(300).optional().or(z.literal("")),
  meetingUrl: z.string().url("Must be a valid URL").max(500).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  type: z.enum(["FOLLOW_UP", "INTERVIEW_PREP", "RESUME_UPDATE", "NETWORKING", "DEADLINE", "REMINDER", "CUSTOM"]),
  priority: z.enum(priorities),
  dueAt: z.string().optional().or(z.literal("")),
  applicationId: z.string().optional().nullable(),
  recurring: z.boolean(),
  recurringInterval: z
    .string()
    .max(4)
    .refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 365), "Must be 1–365 days")
    .optional()
    .or(z.literal("")),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
export type InterviewInput = z.infer<typeof interviewSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type ApplicationStatus = (typeof applicationStatuses)[number];
