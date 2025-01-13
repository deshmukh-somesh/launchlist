import { db } from '@/db';
import { router, privateProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { isPast } from 'date-fns';
import { TRPCError } from '@trpc/server';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import { observable } from '@trpc/server/observable';
import { EventEmitter } from 'events';

const voteEvents = new EventEmitter();

export const productRouter = router({

  // launch product
  launch: privateProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const product = await db.product.findUnique({
        where: { id: input.productId }
      });
      if (!product) throw new Error('Product not found');
      if (product.isLaunched) throw new Error('Product already launched');
      if (isPast(product.launchDate)) {
        throw new Error('Launch date has passed');
      }
      return db.product.update({
        where: { id: input.productId },
        data: { isLaunched: true },
        select: {
          id: true,
          slug: true,
          isLaunched: true
        }
      });
    }),

  // get upcoming products
  getUpcoming: publicProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    return db.product.findMany({
      where: {
        launchDate: {
          gt: today // Get products with launch dates after today
        },
        isLaunched: true
      },
      orderBy: {
        launchDate: 'asc'
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        maker: {
          select: {
            name: true,
            avatarUrl: true
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      }
    });
  }),

  // get yesterday's products
  getYesterday: publicProcedure.query(async ({ ctx }) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return db.product.findMany({
      where: {
        launchDate: {
          gte: yesterday,
          lt: today
        }
      },
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        maker: {
          select: {
            name: true,
            avatarUrl: true,
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      },
      orderBy: {
        votes: {
          _count: 'desc'

        }
      }
    });
  }),

  // get todays winners
  getTodaysWinners: publicProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Get products launched today with most votes
    const winners = await db.product.findMany({
      where: {
        launchDate: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: {
        votes: {
          _count: 'desc' // Order by vote count descending
        }
      },
      take: 3, // Get top 3 winners
      include: {
        categories: {
          include: {
            category: true
          }
        },
        maker: {
          select: {
            name: true,
            avatarUrl: true
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      }
    });
    return winners;
  }),
  // Add this new procedure
  getDashboardProducts: privateProcedure
    .query(async ({ ctx }) => {
      const [products, totalVotes, totalComments] = await Promise.all([
        // Get user's products
        db.product.findMany({
          where: { makerId: ctx.userId },
          select: {
            id: true,
            name: true,
            tagline: true,
            thumbnail: true,
            pricing: true,
            launchDate: true,
            isLaunched: true,
            slug: true,
            _count: {
              select: {
                votes: true,
                comments: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        // Get total votes across all user's products
        db.vote.count({
          where: {
            product: {
              makerId: ctx.userId,
            },
          },
        }),
        // Get total comments across all user's products
        db.comment.count({
          where: {
            product: {
              makerId: ctx.userId,
            },
          },
        }),
      ]);

      return {
        products,
        totalProducts: products.length,
        totalVotes,
        totalComments,
      };
    }),

  // Create new product
  create: privateProcedure
    .input(z.object({
      name: z.string(),
      slug: z.string(),
      tagline: z.string(),
      description: z.string(),
      website: z.string().url(),
      thumbnail: z.string().nullable(),
      pricing: z.enum(['FREE', 'PAID', 'SUBSCRIPTION']),
      launchDate: z.string()
        .transform((str) => new Date(str))
        .refine((date) => date > new Date(), {
          message: "Launch date must be in the future"
        }),
      categoryIds: z.array(z.string()),
      images: z.array(z.string()).optional(),
      isLaunched: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if slug is unique
      const existingProduct = await db.product.findUnique({
        where: { slug: input.slug }
      });

      if (existingProduct) {
        throw new Error('A product with this slug already exists');
      }

      const { categoryIds, images, ...productData } = input;

      const product = await db.product.create({
        data: {
          ...productData,
          makerId: ctx.userId,
          categories: {
            create: categoryIds.map(categoryId => ({
              categoryId,
            })),
          },
          ...(images && images.length > 0 && {
            images: {
              create: images.map(url => ({
                url,
              })),
            },
          }),
        },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          maker: {
            select: {
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
      });

      return product;
    }),

  // Get product details by id (edit mode)
  getProductById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await db.product.findUnique({
        where: { id: input.id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          maker: {
            select: {
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
      });

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      if (product.makerId !== ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authorized to view this product',
        });
      }

      return product;
    }),

  // Toggle vote
  toggleVote: privateProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Must be logged in to vote',
        });
      }

      const existingVote = await db.vote.findUnique({
        where: {
          userId_productId: {
            userId: ctx.userId,
            productId: input.productId,
          },
        },
      });

      // Handle vote toggle
      if (existingVote) {
        // Remove vote
        await db.vote.delete({
          where: {
            userId_productId: {
              userId: ctx.userId,
              productId: input.productId,
            },
          },
        });
      } else {
        // Add vote
        await db.vote.create({
          data: {
            userId: ctx.userId,
            productId: input.productId,
          },
        });
      }

      // Get updated vote count
      const newCount = await db.vote.count({
        where: { productId: input.productId }
      });

      // Return both the count and the new vote status
      return {
        count: newCount,
        hasVoted: !existingVote
      };
    }),

  // Add this new procedure for image uploads
  uploadImage: privateProcedure
    .input(z.object({
      url: z.string().url(),
      productId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.productImage.create({
        data: {
          url: input.url,
          productId: input.productId,
        },
      });
    }),

  // Add this procedure to handle multiple images
  uploadImages: privateProcedure
    .input(z.object({
      urls: z.array(z.string().url()),
      productId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.productImage.createMany({
        data: input.urls.map(url => ({
          url,
          productId: input.productId,
        })),
      });
    }),

  // update product
  update: privateProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      tagline: z.string(),
      description: z.string(),
      website: z.string().url(),
      thumbnail: z.string().nullable(),
      pricing: z.enum(['FREE', 'PAID', 'SUBSCRIPTION']),
      launchDate: z.string().transform((str) => new Date(str)),
      categoryIds: z.array(z.string()),
      images: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, categoryIds, images, ...updateData } = input;

      // Check if product exists and belongs to user
      const existingProduct = await db.product.findUnique({
        where: { id },
        include: { categories: true }
      });

      if (!existingProduct) throw new Error('Product not found');
      if (existingProduct.makerId !== ctx.userId) {
        throw new Error('Not authorized to edit this product');
      }

      return db.product.update({
        where: { id },
        data: {
          ...updateData,
          categories: {
            deleteMany: {},
            create: categoryIds.map(categoryId => ({
              categoryId,
            })),
          },
          ...(images && images.length > 0 && {
            images: {
              deleteMany: {},
              create: images.map(url => ({
                url,
              })),
            },
          }),
        },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          maker: {
            select: {
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
      });
    }),

  // check for duplicate name or slug of the product
  checkDuplicate: privateProcedure
    .input(z.object({
      name: z.string(),
      slug: z.string(),
      excludeId: z.string().optional(), // For edit mode
    }))
    .query(async ({ ctx, input }) => {
      const { name, slug, excludeId } = input;

      const existingProduct = await db.product.findFirst({
        where: {
          OR: [
            { name: { equals: name, mode: 'insensitive' } },
            { slug: { equals: slug, mode: 'insensitive' } }
          ],
          AND: {
            makerId: ctx.user.id,
            // Exclude current product when editing
            ...(excludeId && { NOT: { id: excludeId } })
          }
        },
      });

      return {
        exists: !!existingProduct,
        field: existingProduct?.name === name ? 'name' : 'slug'
      };
    }),

  // Add delete product mutation
  delete: privateProcedure
    .input(z.object({
      productId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const product = await db.product.findUnique({
        where: { id: input.productId }
      });

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found'
        });
      }

      if (product.makerId !== ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authorized to delete this product'
        });
      }

      return db.product.delete({
        where: { id: input.productId }
      });
    }),

  // Get yesterday's winners (top 3)
  getYesterdayWinners: publicProcedure.query(async ({ ctx }) => {
    const yesterday = startOfDay(addDays(new Date(), -1));
    const today = startOfDay(new Date());

    return db.product.findMany({
      where: {
        launchDate: {
          gte: yesterday,
          lt: today
        },
        isLaunched: true
      },
      orderBy: {
        votes: {
          _count: 'desc'
        }
      },
      take: 3, // Get top 3
      include: {
        categories: {
          include: {
            category: true
          }
        },
        maker: {
          select: {
            name: true,
            avatarUrl: true
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      }
    });
  }),

  // Get past launches (paginated)
  getPastLaunches: publicProcedure
    .input(z.object({
      cursor: z.string().nullish(),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const today = startOfDay(new Date());

      const items = await db.product.findMany({
        where: {
          launchDate: {
            lt: today
          },
          isLaunched: true
        },
        orderBy: {
          launchDate: 'desc'
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          categories: {
            include: {
              category: true
            }
          },
          maker: {
            select: {
              name: true,
              avatarUrl: true
            }
          },
          _count: {
            select: {
              votes: true,
              comments: true,
            }
          }
        }
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  // Get next launch time
  getNextLaunch: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();

    const nextLaunch = await db.product.findFirst({
      where: {
        launchDate: {
          gt: now
        },
        isLaunched: true
      },
      orderBy: {
        launchDate: 'asc'
      },
      select: {
        launchDate: true
      }
    });

    return nextLaunch;
  }),

  // Get current vote count
  getVoteCount: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const count = await db.vote.count({
        where: { productId: input.productId }
      });
      return count;
    }),

  // Subscribe to vote updates
  onVoteUpdate: publicProcedure
    .input(z.object({ productId: z.string() }))
    .subscription(({ input }) => {
      return observable((emit) => {
        const onVote = (productId: string, count: number) => {
          if (productId === input.productId) {
            emit.next(count);
          }
        };

        voteEvents.on('vote', onVote);

        return () => {
          voteEvents.off('vote', onVote);
        };
      });
    }),

  // Update your toggleVote mutation to emit events
}); 