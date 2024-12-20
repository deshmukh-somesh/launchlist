import { router, privateProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '@/db';
export const commentRouter = router({
  create: privateProcedure
    .input(z.object({
      productId: z.string(),
      content: z.string(),
      parentId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const comment = await db.comment.create({
        data: {
          content: input.content,
          productId: input.productId,
          userId: ctx.userId,
          parentId: input.parentId,
        },
      });

      // Create notification for product maker
      const product = await db.product.findUnique({
        where: { id: input.productId },
        select: { makerId: true },
      });

      await db.notification.create({
        data: {
          type: 'COMMENT',
          userId: product!.makerId,
          content: `New comment on your product`,
        },
      });

      return comment;
    }),

  delete: privateProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return db.comment.delete({
        where: {
          id: input.commentId,
          userId: ctx.userId, // Ensure user owns the comment
        },
      });
    }),

  getProductComments: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.comment.findMany({
        where: { productId: input.productId },
        include: {
          user: true,
          replies: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }),
}); 