import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: session.user.role ?? "USER",
  };

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}