import { SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    throw redirect("/login");
  }

  return <SidebarProvider>{children}</SidebarProvider>;
}
