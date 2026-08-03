import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { InterviewCoach } from "@/components/interviews/interview-coach";

export const metadata: Metadata = {
  title: "Interview Coach",
};

export default function InterviewCoachPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview Coach"
        description="Practice behavioral questions and get scored feedback."
      />
      <InterviewCoach />
    </div>
  );
}