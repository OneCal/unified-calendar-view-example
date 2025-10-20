import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  editCalendarEvent,
  getCalendarEvent,
} from "@/server/lib/onecal-unified/client";
import type {
  PaginatedResponse,
  UnifiedEvent,
} from "@/server/lib/onecal-unified/types";
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
        UnifiedEvent & {
          calendarId: string;
          calendarColor: string;
          calendarUnifiedId: string;
          calendarUnifiedAccountId: string;
        }
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
                data: [] as UnifiedEvent[],
              } as PaginatedResponse<UnifiedEvent>;
            });

            return events.data.map((event) => ({
              ...event,
              calendarId: calendar.id,
              calendarColor: calendar.color, // Add calendar color for frontend use
              calendarUnifiedId: calendar.unifiedCalendarId,
              calendarUnifiedAccountId:
                calendar.calendarAccount.unifiedAccountId,
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
  getCalendarEvent: publicProcedure
    .input(
      z.object({
        endUserAccountId: z.string(),
        calendarId: z.string(),
        eventId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await getCalendarEvent(
        input.endUserAccountId,
        input.calendarId,
        input.eventId,
      );
    }),
  createCalendarEvent: publicProcedure
    .input(
      z.object({
        endUserAccountId: z.string(),
        calendarId: z.string(),
        title: z.string(),
        start: z.object({
          dateTime: z.string(),
          timeZone: z.string(),
        }),
        end: z.object({
          dateTime: z.string(),
          timeZone: z.string(),
        }),
        attendees: z
          .array(
            z.object({
              email: z.string(),
              name: z.string().optional(),
            }),
          )
          .optional(),
        organizer: z
          .object({
            email: z.string(),
            name: z.string().optional(),
          })
          .optional(),
        description: z.string().optional(),
        isAllDay: z.boolean().optional(),
        isRecurring: z.boolean().optional(),
        recurrence: z.array(z.string()).optional().nullable(),
        transparency: z.enum(["transparent", "opaque"]).optional()
      }),
    )
    .mutation(async ({ input }) => {
      await createCalendarEvent(input.endUserAccountId, input.calendarId, {
        title: input.title,
        start: input.start,
        end: input.end,
        attendees: input.attendees,
        organizer: input.organizer,
        description: input.description,
        transparency: input.transparency,
        isAllDay: input.isAllDay,
        isRecurring: input.isRecurring,
        recurrence: input.recurrence,
      });
      return { success: true };
    }),
  editCalendarEvent: publicProcedure
    .input(
      z.object({
        id: z.string(),
        endUserAccountId: z.string(),
        calendarId: z.string(),
        title: z.string(),
        start: z.object({
          dateTime: z.string(),
          timeZone: z.string(),
        }),
        end: z.object({
          dateTime: z.string(),
          timeZone: z.string(),
        }),
        attendees: z
          .array(
            z.object({
              email: z.string(),
              name: z.string().optional(),
            }),
          )
          .optional(),
        organizer: z
          .object({
            email: z.string(),
            name: z.string().optional(),
          })
          .optional(),
        description: z.string().optional(),
        isAllDay: z.boolean().optional(),
        isRecurring: z.boolean().optional(),
        recurrence: z.array(z.string()).optional().nullable(),
        transparency: z.enum(["transparent", "opaque"]).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await editCalendarEvent(
        input.endUserAccountId,
        input.calendarId,
        input.id,
        {
          title: input.title,
          start: input.start,
          end: input.end,
          attendees: input.attendees,
          organizer: input.organizer,
          description: input.description,
          transparency: input.transparency,
          isAllDay: input.isAllDay,
          isRecurring: input.isRecurring,
          recurrence: input.recurrence,
        },
      );
      return { success: true };
    }),
  deleteCalendarEvent: publicProcedure
    .input(
      z.object({
        endUserAccountId: z.string(),
        calendarId: z.string(),
        eventId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await deleteCalendarEvent(
        input.endUserAccountId,
        input.calendarId,
        input.eventId,
      );
      return { success: true };
    }),
});
