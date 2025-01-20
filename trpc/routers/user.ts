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
      const now = new Date();
      const todayStartUTC = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0, 0, 0
      ));
      const todayEndUTC = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23, 59, 59, 999
      ));

      const [totalProducts, totalUsers, totalLaunchesToday] = await Promise.all([
        // Count all launched products
        db.product.count({
          where: {
            isLaunched: true  // This is correct, but make sure products have this flag set
          }
        }),
        // Count all users (changed from only counting users with activity)
        db.user.count(),  // Now counts all users
        // Count products launched today (UTC)
        db.product.count({
          where: {
            isLaunched: true,
            launchDate: {
              gte: todayStartUTC,
              lte: todayEndUTC
            }
          }
        })
      ]);

      return {
        totalProducts,
        totalUsers,
        totalLaunches24h: totalLaunchesToday
      };
    }),
});
