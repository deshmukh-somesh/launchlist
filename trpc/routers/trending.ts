import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '@/db';

export const trendingRouter = router({
  getTrendingProducts: publicProcedure
    .input(z.object({
      timeframe: z.enum(['DAY', 'WEEK', 'MONTH']).default('WEEK'),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const timeframeDate = new Date();
      switch (input.timeframe) {
        case 'DAY':
          timeframeDate.setDate(timeframeDate.getDate() - 1);
          break;
        case 'WEEK':
          timeframeDate.setDate(timeframeDate.getDate() - 7);
          break;
        case 'MONTH':
          timeframeDate.setMonth(timeframeDate.getMonth() - 1);
          break;
      }

      return db.product.findMany({
        where: {
          createdAt: {
            gte: timeframeDate,
          },
        },
        include: {
          maker: true,
          _count: {
            select: { votes: true },
          },
        },
        orderBy: {
          votes: {
            _count: 'desc',
          },
        },
        take: input.limit,
      });
    }),

  getFeaturedCollections: publicProcedure
    .query(async ({ ctx }) => {
      return db.collection.findMany({
        where: {
          isPublic: true,
        },
        include: {
          user: true,
          products: {
            include: {
              product: true,
            },
            take: 4,
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: {
          products: {
            _count: 'desc',
          },
        },
        take: 5,
      });
    }),
}); 