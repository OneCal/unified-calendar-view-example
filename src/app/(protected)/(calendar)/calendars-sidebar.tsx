"use client";

import { GoogleLogoIcon } from "@/components/icons/google-logo";
import { MicrosoftLogoIcon } from "@/components/icons/microsoft-logo";
import { ProviderLogoIcon } from "@/components/icons/provider-logo";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { getConnectCalendarUrl } from "@/lib/calendars";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  CalendarAccountProvider,
  CalendarAccountStatus,
  type CalendarAccount,
} from "@prisma/client";

import {
  ChevronRightIcon,
  EyeOffIcon,
  PlusIcon,
  RefreshCcwIcon,
  TrashIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { toast } from "sonner";

export function CalendarsSidebar({ userId }: { userId: string }) {
  const { data: calendarAccounts } = api.calendarAccounts.getAll.useQuery();
  const { mutateAsync: setIsHidden } = api.calendars.setIsHidden.useMutation();

  const handleSetIsHidden = async (calendarId: string, isHidden: boolean) => {
    try {
      await setIsHidden({ calendarId, isHidden });
    } catch (error) {
      console.error(error);
      toast.error("Failed to set calendar visibility");
    }
  };

  const handleRefreshConnection = async (account: CalendarAccount) => {
    try {
      window.location.href = getConnectCalendarUrl({
        provider: account.provider,
        userId,
        loginHint: account.email,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to refresh connection");
    }
  };

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Calendars</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(calendarAccounts || []).map((calendarAccount) => (
                <SidebarMenuItem key={calendarAccount.id}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton>
                        <ProviderLogoIcon provider={calendarAccount.provider} />
                        <span
                          className={cn("flex-shrink font-medium", {
                            "text-destructive":
                              calendarAccount.status ===
                              CalendarAccountStatus.EXPIRED,
                          })}
                        >
                          {calendarAccount.email}
                        </span>
                        {calendarAccount.status ===
                          CalendarAccountStatus.EXPIRED && (
                          <TriangleAlertIcon className="text-destructive ml-auto" />
                        )}
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-(--radix-popper-anchor-width)">
                      <DropdownMenuItem
                        onClick={() => handleRefreshConnection(calendarAccount)}
                      >
                        <RefreshCcwIcon />
                        Refresh Connection
                        {calendarAccount.status ===
                          CalendarAccountStatus.EXPIRED && (
                          <TriangleAlertIcon className="text-destructive ml-auto" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <TrashIcon />
                        Disconnect
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {calendarAccount.calendars.map((calendar) => (
                    <SidebarMenuSub key={calendar.id}>
                      <SidebarMenuSubItem>
                        <SidebarMenuButton
                          className={cn({
                            "opacity-50": calendar.isHidden,
                          })}
                          onClick={() => {
                            handleSetIsHidden(calendar.id, !calendar.isHidden);
                          }}
                        >
                          <div
                            className="bg-secondary size-3 flex-shrink-0 rounded"
                            style={{
                              backgroundColor: calendar.color ?? undefined,
                            }}
                          ></div>
                          {calendar.name}
                          {calendar.isHidden && (
                            <EyeOffIcon className="ml-auto" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  ))}
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
                        href={getConnectCalendarUrl({
                          provider: CalendarAccountProvider.GOOGLE,
                          userId,
                        })}
                      >
                        <GoogleLogoIcon />
                        Google Calendar
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={getConnectCalendarUrl({
                          provider: CalendarAccountProvider.MICROSOFT,
                          userId,
                        })}
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
