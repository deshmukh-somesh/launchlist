import { db } from '@/db';
import { router, privateProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';

export const userRouter = router({
  // Get user profile
  getProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await db.user.findUnique({
        where: { username: input.username },
        include: {
          products: true,
          followers: true,
          following: true,
        },
      });
      return user;
    }),

  // Update user profile
  updateProfile: privateProcedure
    .input(z.object({
      name: z.string().optional(),
      bio: z.string().optional(),
      website: z.string().url().optional(),
      twitter: z.string().optional(),
      github: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.user.update({
        where: { id: ctx.userId },
        data: input,
      });
    }),

  // Follow/Unfollow user
  toggleFollow: privateProcedure
    .input(z.object({ targetUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingFollow = await db.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: ctx.userId,
            followingId: input.targetUserId,
          },
        },
      });

      if (existingFollow) {
        return db.follows.delete({
          where: {
            followerId_followingId: {
              followerId: ctx.userId,
              followingId: input.targetUserId,
            },
          },
        });
      }

      return db.follows.create({
        data: {
          followerId: ctx.userId,
          followingId: input.targetUserId,
        },
      });
    }),

  // Get platform statistics
  getPlatformStats: publicProcedure
    .query(async () => {
      const [
        totalProducts,
        totalUsers,
        totalLaunches24h
      ] = await Promise.all([
        // Get total products
        db.product.count({
          where: {
            isLaunched: true
          }
        }),
        // Get total users
        db.user.count(),
        // Get launches in last 24 hours
        db.product.count({
          where: {
            isLaunched: true,
            launchDate: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      return {
        totalProducts,
        totalUsers,
        totalLaunches24h
      };
    }),
});
