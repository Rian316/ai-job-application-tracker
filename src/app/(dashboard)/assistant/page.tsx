import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { AssistantChat } from "@/components/assistant/assistant-chat";

export const metadata: Metadata = {
  title: "AI Assistant",
};

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant"
        description="Strategy, follow-ups, interview prep and weekly reports — powered by AI."
      />
      <AssistantChat />
    </div>
  );
}