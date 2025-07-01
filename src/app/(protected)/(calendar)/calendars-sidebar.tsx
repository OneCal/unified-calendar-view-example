import { GoogleLogoIcon } from "@/components/icons/google-logo";
import { MicrosoftLogoIcon } from "@/components/icons/microsoft-logo";
import { ProviderLogoIcon } from "@/components/icons/provider-logo";
import {
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getConnectCalendarUrl } from "@/lib/calendars";
import type { api } from "@/trpc/server";
import { CalendarAccountProvider } from "@prisma/client";

import { PlusIcon } from "lucide-react";

export function CalendarsSidebar({
  calendarAccounts,
  userId,
}: {
  calendarAccounts: Awaited<ReturnType<typeof api.calendarAccounts.getAll>>;
  userId: string;
}) {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Calendars</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {calendarAccounts.map((calendarAccount) => (
                <SidebarMenuItem key={calendarAccount.id}>
                  <SidebarMenuButton>
                    <ProviderLogoIcon provider={calendarAccount.provider} />
                    <span className="font-medium">{calendarAccount.email}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="w-full">
                      <PlusIcon />
                      Connect calendar
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-(--radix-popper-anchor-width)">
                    <DropdownMenuItem asChild>
                      <a
                        href={getConnectCalendarUrl(
                          CalendarAccountProvider.GOOGLE,
                          userId,
                        )}
                      >
                        <GoogleLogoIcon />
                        Google Calendar
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={getConnectCalendarUrl(
                          CalendarAccountProvider.MICROSOFT,
                          userId,
                        )}
                      >
                        <MicrosoftLogoIcon />
                        Microsoft Calendar
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
