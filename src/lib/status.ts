export const statusConfig = {
  WISHLIST: { label: "Wishlist", className: "bg-muted text-muted-foreground" },
  PREPARING: { label: "Preparing", className: "bg-muted text-muted-foreground" },
  APPLIED: { label: "Applied", className: "bg-blue-500/10 text-blue-500" },
  RESUME_VIEWED: { label: "Resume Viewed", className: "bg-cyan-500/10 text-cyan-500" },
  PHONE_SCREENING: { label: "Phone Screening", className: "bg-violet-500/10 text-violet-500" },
  ASSESSMENT: { label: "Assessment", className: "bg-fuchsia-500/10 text-fuchsia-500" },
  TECHNICAL_INTERVIEW: { label: "Technical Interview", className: "bg-violet-500/10 text-violet-500" },
  MANAGER_INTERVIEW: { label: "Manager Interview", className: "bg-indigo-500/10 text-indigo-500" },
  FINAL_INTERVIEW: { label: "Final Interview", className: "bg-purple-500/10 text-purple-500" },
  OFFER: { label: "Offer", className: "bg-emerald-500/10 text-emerald-500" },
  NEGOTIATION: { label: "Negotiation", className: "bg-amber-500/10 text-amber-500" },
  ACCEPTED: { label: "Accepted", className: "bg-emerald-500/10 text-emerald-500" },
  REJECTED: { label: "Rejected", className: "bg-rose-500/10 text-rose-500" },
  WITHDRAWN: { label: "Withdrawn", className: "bg-muted text-muted-foreground" },
  ARCHIVED: { label: "Archived", className: "bg-muted text-muted-foreground" },
} as const;

export type ApplicationStatus = keyof typeof statusConfig;

export const statusOrder: ApplicationStatus[] = [
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
];

export const kanbanColumns = [
  { status: "WISHLIST", label: "Wishlist", color: "bg-muted" },
  { status: "APPLIED", label: "Applied", color: "bg-blue-500" },
  { status: "INTERVIEW", label: "Interview", color: "bg-violet-500" },
  { status: "OFFER", label: "Offer", color: "bg-emerald-500" },
  { status: "REJECTED", label: "Rejected", color: "bg-rose-500" },
  { status: "ARCHIVED", label: "Archive", color: "bg-muted-foreground" },
] as const;

export function kanbanStatusesFor(status: ApplicationStatus): string {
  return status;
}

export const sourceConfig = {
  LINKEDIN: "LinkedIn",
  INDEED: "Indeed",
  GLASSDOOR: "Glassdoor",
  REFERRAL: "Referral",
  WEBSITE: "Website",
  RECRUITER: "Recruiter",
  OTHER: "Other",
} as const;

export const workModeConfig = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "Onsite",
} as const;

export const priorityConfig = {
  LOW: { label: "Low", className: "bg-muted text-muted-foreground" },
  MEDIUM: { label: "Medium", className: "bg-primary/10 text-primary" },
  HIGH: { label: "High", className: "bg-amber-500/10 text-amber-500" },
  URGENT: { label: "Urgent", className: "bg-rose-500/10 text-rose-500" },
} as const;