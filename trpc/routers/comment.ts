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
          userId: ctx.userId,
        },
      });
    }),

  getProductComments: publicProcedure
    .input(z.object({
      productId: z.string(),
      limit: z.number().min(1).max(50).default(10),
      cursor: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { productId, cursor, limit } = input;

      const items = await db.comment.findMany({
        take: limit + 1,
        skip: cursor,
        where: { 
          productId,
          parentId: null // Only get top-level comments
        },
        include: {
          user: true,
          replies: {
            include: { 
              user: true,
            },
            take: 3, // Limit initial replies
            orderBy: {
              createdAt: 'desc'
            }
          },
          _count: {
            select: {
              replies: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
      });

      let nextCursor: number | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = cursor + limit;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getReplies: publicProcedure
    .input(z.object({
      commentId: z.string(),
      limit: z.number().min(1).max(50).default(10),
      cursor: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { commentId, cursor, limit } = input;

      const replies = await db.comment.findMany({
        take: limit + 1,
        skip: cursor,
        where: { 
          parentId: commentId
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
      });

      let nextCursor: number | undefined = undefined;
      if (replies.length > limit) {
        const nextItem = replies.pop();
        nextCursor = cursor + limit;
      }

      return {
        items: replies,
        nextCursor,
      };
    }),
}); 