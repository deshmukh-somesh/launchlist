import { router, privateProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '@/db';

export const categoryRouter = router({
  create: privateProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.category.create({
        data: input,
      });
    }),

  update: privateProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.category.update({
        where: { id: input.id },
        data: input,
      });
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return db.category.delete({
        where: { id: input.id },
      });
    }),

  getAll: publicProcedure.query(async () => {
    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: 'asc', // Sort alphabetically
      },
    });
    
    return categories;
  }),
}); 