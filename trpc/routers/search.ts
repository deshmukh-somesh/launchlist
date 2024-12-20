import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '@/db';

export const searchRouter = router({
  search: publicProcedure
    .input(z.object({
      query: z.string(),
      type: z.enum(['PRODUCTS', 'USERS', 'COLLECTIONS']).default('PRODUCTS'),
      limit: z.number().min(1).max(50).default(10),
      cursor: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      switch (input.type) {
        case 'PRODUCTS':
          return db.product.findMany({
            where: {
              OR: [
                { name: { contains: input.query, mode: 'insensitive' } },
                { tagline: { contains: input.query, mode: 'insensitive' } },
                { description: { contains: input.query, mode: 'insensitive' } },
              ],
            },
            include: {
              maker: true,
              _count: {
                select: { votes: true },
              },
            },
            take: input.limit,
            skip: input.cursor,
          });

        case 'USERS':
          return db.user.findMany({
            where: {
              OR: [
                { name: { contains: input.query, mode: 'insensitive' } },
                { username: { contains: input.query, mode: 'insensitive' } },
              ],
            },
            take: input.limit,
            skip: input.cursor,
          });

        case 'COLLECTIONS':
          return db.collection.findMany({
            where: {
              AND: [
                { isPublic: true },
                {
                  OR: [
                    { name: { contains: input.query, mode: 'insensitive' } },
                    { description: { contains: input.query, mode: 'insensitive' } },
                  ],
                },
              ],
            },
            include: {
              user: true,
              _count: {
                select: { products: true },
              },
            },
            take: input.limit,
            skip: input.cursor,
          });
      }
    }),
}); 