import { CalendarsSidebar } from "@/app/(protected)/(calendar)/calendars-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getServerSession, requireServerSession } from "@/server/auth";
import { api } from "@/trpc/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireServerSession();
  const calendarAccounts = await api.calendarAccounts.getAll();

  return (
    <>
      <CalendarsSidebar
        calendarAccounts={calendarAccounts}
        userId={session.user.id}
      />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </>
  );
}
