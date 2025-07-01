import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const calendarsRouter = createTRPCRouter({
  setIsHidden: protectedProcedure
    .input(
      z.object({
        calendarId: z.string(),
        isHidden: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.calendar.update({
        where: { id: input.calendarId, userId: ctx.session.user.id },
        data: { isHidden: input.isHidden },
      });
    }),
});
