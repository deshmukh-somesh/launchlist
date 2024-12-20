import { router, privateProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '@/db';

export const notificationRouter = router({
  getUnread: privateProcedure
    .query(async ({ ctx }) => {
      return db.notification.findMany({
        where: {
          userId: ctx.userId,
          isRead: false,
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  markAsRead: privateProcedure
    .input(z.object({
      notificationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.notification.update({
        where: {
          id: input.notificationId,
          userId: ctx.userId,
        },
        data: { isRead: true },
      });
    }),

  markAllAsRead: privateProcedure
    .mutation(async ({ ctx }) => {
      return db.notification.updateMany({
        where: {
          userId: ctx.userId,
          isRead: false,
        },
        data: { isRead: true },
      });
    }),
}); 