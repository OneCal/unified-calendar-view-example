import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { getCalendarEvents } from "@/server/lib/onecal-unified/client";
import type {
  PaginatedResponse,
  UnifiedEvent,
} from "@/server/lib/onecal-unified/types";
import { formatICalDate, getRRuleObjectFromRRuleString } from "@/lib/utils";
import { addMinutes, differenceInMinutes } from "date-fns";
import { HTTPError } from "ky";
import { CalendarAccountStatus } from "@prisma/client";

export const calendarEventsRouter = createTRPCRouter({
  getCalendarEvents: publicProcedure
    .input(z.object({ startDate: z.date(), endDate: z.date() }))
    .query(async ({ ctx, input }) => {
      const visibleCalendars = await ctx.db.calendar.findMany({
        where: {
          isHidden: false,
          calendarAccount: {
            status: CalendarAccountStatus.ACTIVE,
          },
        },
        include: {
          calendarAccount: true,
        },
      });

      let events: Array<
        UnifiedEvent & { calendarId: string; calendarColor: string }
      > = [];

      const calendarEvents: Array<
        UnifiedEvent & { calendarId: string; calendarColor: string }
      > = (
        await Promise.all(
          visibleCalendars.map(async (calendar) => {
            const events = await getCalendarEvents(
              calendar.calendarAccount.unifiedAccountId,
              calendar.unifiedCalendarId,
              {
                startDateTime: input.startDate.toISOString(),
                endDateTime: input.endDate.toISOString(),
                expandRecurrences: true,
              },
            ).catch(async (err) => {
              if (err instanceof HTTPError) {
                const errorJson = await err.response.json();
                if (errorJson.error === "InvalidRefreshToken") {
                  await ctx.db.calendarAccount.update({
                    where: { id: calendar.calendarAccount.id },
                    data: {
                      status: CalendarAccountStatus.EXPIRED,
                    },
                  });
                } else {
                  console.error(
                    `Failed to fetch calendar events for calendar ${calendar.id}. Message: ${errorJson.message}`,
                  );
                }
              }

              return {
                items: [] as UnifiedEvent[],
              } as PaginatedResponse<UnifiedEvent>;
            });

            return events.items.map((event) => ({
              ...event,
              calendarId: calendar.id,
              calendarColor: calendar.color, // Add calendar color for frontend use
            }));
          }),
        )
      ).reduce((acc, curr) => {
        acc.push(...curr);
        return acc;
      }, []);

      for (const event of calendarEvents) {
        if (event.isCancelled) continue;
          events.push(event);
      }

      return events;
    }),
});
