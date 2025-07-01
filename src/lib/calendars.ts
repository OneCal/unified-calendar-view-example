import { env } from "@/env";
import { stateToB64 } from "@/lib/utils";
import { CalendarAccountProvider } from "@prisma/client";

export function getConnectCalendarUrl(
  provider: CalendarAccountProvider,
  userId: string,
) {
  const state = stateToB64({ userId });
  switch (provider) {
    case CalendarAccountProvider.GOOGLE:
      return `${env.NEXT_PUBLIC_ONECAL_UNIFIED_URL}/oauth/authorize/${env.NEXT_PUBLIC_ONECAL_UNIFIED_APP_ID}/google?redirectUrl=${env.NEXT_PUBLIC_APP_URL}/api/connect&state=${state}`;
    case CalendarAccountProvider.MICROSOFT:
      return `${env.NEXT_PUBLIC_ONECAL_UNIFIED_URL}/oauth/authorize/${env.NEXT_PUBLIC_ONECAL_UNIFIED_APP_ID}/microsoft?redirectUrl=${env.NEXT_PUBLIC_APP_URL}/api/connect&state=${state}`;
  }
}
