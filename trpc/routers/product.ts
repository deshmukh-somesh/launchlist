import { db } from '@/db';
import { router, privateProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';

export const productRouter = router({
  // Create new product
  create: privateProcedure
    .input(z.object({
      name: z.string(),
      slug: z.string(),
      tagline: z.string(),
      description: z.string(),
      website: z.string().url(),
      thumbnail: z.string().optional(),
      pricing: z.enum(['FREE', 'PAID', 'SUBSCRIPTION']),
      launchDate: z.date(),
      categoryIds: z.array(z.string()),
      images: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.product.create({
        data: {
          ...input,
          makerId: ctx.userId,
          categories: {
            create: input.categoryIds.map(categoryId => ({
              categoryId,
            })),
          },
          images: input.images ? {
            create: input.images.map(url => ({ url })),
          } : undefined,
        },
      });
    }),

  // Get product details
  getProduct: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.product.findUnique({
        where: { slug: input.slug },
        include: {
          maker: true,
          categories: {
            include: { category: true },
          },
          comments: {
            include: { user: true },
          },
          votes: true,
          images: true,
        },
      });
    }),

  // Toggle vote
  toggleVote: privateProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingVote = await db.vote.findUnique({
        where: {
          userId_productId: {
            userId: ctx.userId,
            productId: input.productId,
          },
        },
      });

      if (existingVote) {
        return db.vote.delete({
          where: {
            userId_productId: {
              userId: ctx.userId,
              productId: input.productId,
            },
          },
        });
      }

      return db.vote.create({
        data: {
          userId: ctx.userId,
          productId: input.productId,
        },
      });
    }),
}); 