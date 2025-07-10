import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { getCalendarEvents } from "@/server/lib/onecal-unified/client";
import type {
  PaginatedResponse,
  UnifiedEvent,
} from "@/server/lib/onecal-unified/types";
import { formatICalDate, getRRuleObjectFromRRuleString } from "@/lib/utils";
import { addMinutes, differenceInMinutes } from "date-fns";
import { TRPCError } from "@trpc/server";
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

      let events: Array<UnifiedEvent & { calendarId: string }> = [];

      const calendarEvents: Array<UnifiedEvent & { calendarId: string }> = (
        await Promise.all(
          visibleCalendars.map(async (calendar) => {
            const events = await getCalendarEvents(
              calendar.calendarAccount.unifiedAccountId,
              calendar.unifiedCalendarId,
              {
                timeMin: input.startDate.toISOString(),
                timeMax: input.endDate.toISOString(),
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
            }));
          }),
        )
      ).reduce((acc, curr) => {
        acc.push(...curr);
        return acc;
      }, []);

      for (const event of calendarEvents) {
        if (event.isCancelled) continue;

        if (event.isRecurring && event.recurrence) {
          const rruleString = event.recurrence.find((r) =>
            r.startsWith("RRULE:"),
          );
          if (
            !rruleString ||
            !event.start?.dateTime ||
            !event.start?.timeZone ||
            !event.end?.dateTime
          ) {
            continue;
          }

          const exDates = calendarEvents
            .filter(
              (e) =>
                (e.isException || e.isCancelled) &&
                e.recurringEventId === event.id,
            )
            .map((e) => e.originalStart?.dateTime as string);

          // expand the recurrence into a list of occurrences
          const rrule = getRRuleObjectFromRRuleString(
            event.start?.dateTime,
            event.start?.timeZone,
            rruleString,
            exDates,
          );

          const occurrences = rrule.between(
            input.startDate,
            input.endDate,
            true,
          );

          const duration = differenceInMinutes(
            event.end?.dateTime,
            event.start?.dateTime,
          );
          const occurrencesEvents = occurrences.map((occurrence) => ({
            ...event,
            id: `${event.id}_${formatICalDate(occurrence.toISOString(), event.start?.timeZone ?? "UTC")}`,
            start: { ...event.start, dateTime: occurrence.toISOString() },
            end: {
              ...event.end,
              dateTime: addMinutes(occurrence, duration).toISOString(),
            },
          }));

          events.push(...occurrencesEvents);
        } else {
          events.push(event);
        }
      }

      return events;
    }),
});
