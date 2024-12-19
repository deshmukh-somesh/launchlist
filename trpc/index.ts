import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { Prisma } from '@prisma/client';

export const appRouter = router({

  
  // Get Products with filters and pagination
  getProducts: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(12),
        category: z.string().optional(),
        pricing: z.enum(['FREE', 'PAID', 'SUBSCRIPTION']).optional(),
        sortBy: z.enum(['newest', 'popular', 'votes']).default('newest'),
      })
    )
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;

      const where = {
        ...(input.category && {
          categories: {
            some: {
              category: {
                name: input.category,
              },
            },
          },
        }),
        ...(input.pricing && {
          pricing: input.pricing,
        }),
      };

      const orderBy = {
        ...(input.sortBy === 'newest' && { createdAt: Prisma.SortOrder.desc }),
        ...(input.sortBy === 'popular' && { views: Prisma.SortOrder.desc }),
        ...(input.sortBy === 'votes' && { 
          votes: {
            _count: Prisma.SortOrder.desc
          }
        }),
      };

      const [products, total] = await Promise.all([
        db.product.findMany({
          where,
          orderBy,
          skip,
          take: input.limit,
          include: {
            maker: {
              select: {
                name: true,
                username: true,
                avatarUrl: true,
              },
            },
            categories: {
              include: {
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            votes: true,
            _count: {
              select: {
                votes: true,
              },
            },
          },
        }),
        db.product.count({ where }),
      ]);

      return {
        products,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  // Get Categories
  getCategories: publicProcedure.query(async () => {
    return await db.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }),

  // Vote on a product
  voteProduct: privateProcedure
    .input(z.object({
      productId: z.string(),
    }))
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
        await db.vote.delete({
          where: {
            userId_productId: {
              userId: ctx.userId,
              productId: input.productId,
            },
          },
        });
        return { action: 'removed' };
      }

      await db.vote.create({
        data: {
          userId: ctx.userId,
          productId: input.productId,
        },
      });
      return { action: 'added' };
    }),

  // Get user's voted products
  getUserVotes: privateProcedure.query(async ({ ctx }) => {
    const votes = await db.vote.findMany({
      where: {
        userId: ctx.userId,
      },
      select: {
        productId: true,
      },
    });
    return votes.map(vote => vote.productId);
  }),

  // Create a new product
  createProduct: privateProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        tagline: z.string(),
        description: z.string(),
        website: z.string().url(),
        thumbnail: z.string().optional(),
        pricing: z.enum(['FREE', 'PAID', 'SUBSCRIPTION']),
        launchDate: z.date(),
        categoryIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await db.product.create({
        data: {
          ...input,
          makerId: ctx.userId,
          categories: {
            create: input.categoryIds.map(categoryId => ({
              category: {
                connect: {
                  id: categoryId,
                },
              },
            })),
          },
        },
      });
    }),

  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" });

    // Check if the user is in the database
    const dbUser = await db.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          { email: user.email }
        ]
      },
    });

    if (!dbUser) {
      // Create new user with required fields
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.given_name ? `${user.given_name} ${user.family_name || ''}`.trim() : null,
          username: generateUsername(user.email), // You'll need to implement this
          avatarUrl: user.picture || null,
        },
      });
    } else if (dbUser.id !== user.id) {
      // Update existing user with new ID and any missing information
      await db.user.update({
        where: { email: user.email },
        data: {
          id: user.id,
          name: dbUser.name || (user.given_name ? `${user.given_name} ${user.family_name || ''}`.trim() : null),
          avatarUrl: dbUser.avatarUrl || user.picture || null,
        }
      });
    }

    return { success: true };
  }),
});

// Helper function to generate a unique username
function generateUsername(email: string): string {
  // Remove everything after @ and any special characters
  const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
  
  // Add a random number to make it more likely to be unique
  const randomSuffix = Math.floor(Math.random() * 1000);
  
  return `${baseUsername}${randomSuffix}`;
}

// Add this type to handle username uniqueness check
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  const existingUser = await db.user.findUnique({
    where: { username },
  });
  return !existingUser;
};

export type AppRouter = typeof appRouter;
