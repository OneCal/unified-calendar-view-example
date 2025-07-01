import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const calendarAccountsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.calendarAccount.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        calendars: true,
      },
    });
  }),
});
