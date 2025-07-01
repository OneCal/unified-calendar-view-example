import { GoogleLogoIcon } from "@/components/icons/google-logo";
import { MicrosoftLogoIcon } from "@/components/icons/microsoft-logo";
import { ProviderLogoIcon } from "@/components/icons/provider-logo";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { getConnectCalendarUrl } from "@/lib/calendars";
import type { api } from "@/trpc/server";
import { CalendarAccountProvider } from "@prisma/client";

import { ChevronRightIcon, PlusIcon } from "lucide-react";

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
                <Collapsible
                  key={calendarAccount.id}
                  defaultOpen
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <ProviderLogoIcon provider={calendarAccount.provider} />
                        <span className="flex-shrink font-medium">
                          {calendarAccount.email}
                        </span>
                        <ChevronRightIcon className="ml-auto flex-shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {calendarAccount.calendars.map((calendar) => (
                        <SidebarMenuSub key={calendar.id}>
                          <SidebarMenuSubItem>
                            <SidebarMenuButton>
                              <div
                                className="bg-secondary size-3 flex-shrink-0 rounded"
                                style={{
                                  backgroundColor: calendar.color ?? undefined,
                                }}
                              ></div>
                              {calendar.name}
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      ))}
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
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
