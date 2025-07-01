import { CalendarsSidebar } from "@/app/(protected)/(calendar)/calendars-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getServerSession, requireServerSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { HydrationBoundary } from "@tanstack/react-query";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireServerSession();
  void api.calendarAccounts.getAll.prefetch();

  return (
    <HydrationBoundary>
      <CalendarsSidebar userId={session.user.id} />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </HydrationBoundary>
  );
}
