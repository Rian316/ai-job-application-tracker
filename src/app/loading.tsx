import { Briefcase } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-400 text-white shadow-lg">
        <Briefcase className="size-6" />
      </div>
      <div className="flex items-center gap-2">
        <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}