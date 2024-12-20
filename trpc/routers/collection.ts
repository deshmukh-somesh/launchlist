import { router, privateProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '@/db';

export const collectionRouter = router({
  // Create collection
  create: privateProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      isPublic: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.collection.create({
        data: {
          ...input,
          userId: ctx.userId,
        },
      });
    }),

  // Add product to collection
  addProduct: privateProcedure
    .input(z.object({
      collectionId: z.string(),
      productId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.collectionsOnProducts.create({
        data: {
          collectionId: input.collectionId,
          productId: input.productId,
        },
      });
    }),

  // Get user collections
  getUserCollections: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.collection.findMany({
        where: {
          userId: input.userId,
          isPublic: true,
        },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });
    }),
}); 