import { db } from '@/db';
import { router, privateProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';

export const userRouter = router({
  // Get current user's profile for the form
  getProfile: privateProcedure
    .query(async ({ ctx }) => {
      const user = await db.user.findUnique({
        where: { id: ctx.userId },
        select: {
          name: true,
          // username: true,
          bio: true,
          website: true,
          twitter: true,
          github: true,
          avatarUrl: true,
          email: true,
        },
      });
      if (!user) {
        return {
          name: null,
          bio: null,
          website: null,
          twitter: null,
          github: null,
          avatarUrl: null
        };
      }

      return user;
    }),

  // Get public profile by username (for viewing other profiles)
  getPublicProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await db.user.findUnique({
        where: { username: input.username },
        select: {
          id: true,
          name: true,
          username: true,
          bio: true,
          avatarUrl: true,
          twitter: true,
          products: true,
          followers: true,
          following: true,
        },
      });
      return user;
    }),

  // Update user profile with validation
  updateProfile: privateProcedure
    .input(z.object({
      name: z.string().min(1, "Name is required"),
      // username: z.string().min(1, "Username is required")
      //   .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
      bio: z.string().nullable(),
      website: z.string().url().nullable().or(z.literal('')),
      twitter: z.string()
        .regex(/^[A-Za-z0-9_]{1,15}$/, "Invalid Twitter handle")
        .nullable()
        .or(z.literal('')),
      github: z.string()
        .regex(/^[A-Za-z0-9-]+$/, "Invalid GitHub username")
        .nullable()
        .or(z.literal('')),
      avatarUrl: z.string().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if username is already taken (excluding current user)
      // if (input.username) {
      //   const existingUser = await db.user.findFirst({
      //     where: {
      //       username: input.username,
      //       NOT: {
      //         id: ctx.userId
      //       }
      //     }
      //   });

      //   if (existingUser) {
      //     throw new Error("Username is already taken");
      //   }
      // }
      const user = await db.user.findUnique({
        where: { id: ctx.userId },
        select: { email: true }
      });


      if (!user?.email) {
        throw new Error("User email not found");
      }

      // Generate a username from email if it doesn't exist
      const username = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

      // Clean up empty string inputs to be null
      const cleanedInput = {
        ...input,
        website: input.website || null,
        twitter: input.twitter || null,
        github: input.github || null,
        // Only set username if updating for first time
        username: username,
      };

      try {
        const updatedUser = await db.user.update({
          where: { id: ctx.userId },
          data: cleanedInput,
        });

        return updatedUser;
      } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
          // If username already exists, append a random number
          const randomSuffix = Math.floor(Math.random() * 1000);
          const alternativeUsername = `${username}${randomSuffix}`;

          const retryUpdate = await db.user.update({
            where: { id: ctx.userId },
            data: {
              ...cleanedInput,
              username: alternativeUsername
            },
          });

          return retryUpdate;
        }

        console.error('Error updating profile:', error);
        throw new Error("Failed to update profile");
      }
    }),

  // Check if profile is complete
  // isProfileComplete: privateProcedure
  //   .query(async ({ ctx }) => {
  //     const user = await db.user.findUnique({
  //       where: { id: ctx.userId },
  //       select: {
  //         name: true,
  //         username: true,
  //       },
  //     });

  //     return {
  //       isComplete: !!(user?.name && user?.username),
  //       user
  //     };
  //   }),
  isProfileComplete: privateProcedure
    .query(async ({ ctx }) => {
      const user = await db.user.findUnique({
        where: { id: ctx.userId },
        select: {
          name: true,
        },
      });

      return {
        isComplete: !!user?.name,
        user
      };
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
