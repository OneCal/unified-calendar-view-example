import { env } from "@/env";
import { stateToB64 } from "@/lib/utils";
import { CalendarAccountProvider } from "@prisma/client";

export function getConnectCalendarUrl({
  provider,
  userId,
  loginHint,
}: {
  provider: CalendarAccountProvider;
  userId: string;
  loginHint?: string;
}) {
  const state = stateToB64({ userId });

  const queryParams = new URLSearchParams({
    redirectUrl: `${env.NEXT_PUBLIC_APP_URL}/api/connect`,
    state,
  });

  if (loginHint) {
    queryParams.set("loginHint", loginHint);
  }

  switch (provider) {
    case CalendarAccountProvider.GOOGLE:
      return `${env.NEXT_PUBLIC_ONECAL_UNIFIED_URL}/oauth/authorize/${env.NEXT_PUBLIC_ONECAL_UNIFIED_APP_ID}/google?${queryParams}`;
    case CalendarAccountProvider.MICROSOFT:
      return `${env.NEXT_PUBLIC_ONECAL_UNIFIED_URL}/oauth/authorize/${env.NEXT_PUBLIC_ONECAL_UNIFIED_APP_ID}/microsoft?${queryParams}`;
  }
}
