import { env } from "@/env";
import { stateFromB64 } from "@/lib/utils";
import { db } from "@/server/db";
import {
  getCalendarsForEndUserAccount,
  getEndUserAccountById,
} from "@/server/lib/onecal-unified/client";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const endUserAccountId = params.get("endUserAccountId");
  const state = params.get("state");

  if (!endUserAccountId) {
    return Response.redirect(
      `${env.BETTER_AUTH_URL}?error=MISSING_END_USER_ACCOUNT_ID`,
    );
  } else if (!state) {
    return Response.redirect(`${env.BETTER_AUTH_URL}?error=MISSING_STATE`);
  }

  const { userId } = stateFromB64(state);
  const endUserAccount = await getEndUserAccountById(endUserAccountId);

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return Response.redirect(`${env.BETTER_AUTH_URL}?error=USER_NOT_FOUND`);
  }

  const calendarAccount = await db.calendarAccount.upsert({
    where: {
      email_provider_userId: {
        email: endUserAccount.email,
        userId,
        provider: endUserAccount.providerType,
      },
    },
    update: {
      status: endUserAccount.status,
      unifiedAccountId: endUserAccount.id,
    },
    create: {
      email: endUserAccount.email,
      provider: endUserAccount.providerType,
      userId,
      unifiedAccountId: endUserAccount.id,
      status: endUserAccount.status,
    },
    include: {
      calendars: true,
    },
  });

  if (!user.onboardingCompletedAt) {
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        onboardingCompletedAt: new Date(),
      },
    });
  }

  const calendars = await getCalendarsForEndUserAccount(endUserAccount.id);

  for (const calendar of calendars.items) {
    await db.calendar.upsert({
      where: {
        unifiedCalendarId_calendarAccountId: {
          unifiedCalendarId: calendar.id,
          calendarAccountId: calendarAccount.id,
        },
      },
      update: {
        name: calendar.name,
        color: calendar.hexColor,
        timezone: calendar.timeZone,
        isPrimary: calendar.isPrimary,
      },
      create: {
        name: calendar.name ?? "",
        color: calendar.hexColor,
        timezone: calendar.timeZone,
        isPrimary: calendar.isPrimary,
        unifiedCalendarId: calendar.id,
        userId: userId,
        calendarAccountId: calendarAccount.id,
      },
    });
  }

  const calendarIdsToDelete = calendarAccount.calendars
    .filter(
      (calendar) =>
        !calendars.items.some((c) => c.id === calendar.unifiedCalendarId),
    )
    .map((calendar) => calendar.id);

  // Delete calendars that are no longer in this account
  await db.calendar.deleteMany({
    where: {
      id: { in: calendarIdsToDelete },
    },
  });

  return Response.redirect(`${env.BETTER_AUTH_URL}/`);
}
