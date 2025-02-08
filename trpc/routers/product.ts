import { db } from '@/db';
import { router, privateProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { isPast } from 'date-fns';
import { TRPCError } from '@trpc/server';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import { observable } from '@trpc/server/observable';
import { EventEmitter } from 'events';

// Helper function to get UTC dates
function getUTCDate(date: Date) {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  ));
}

const voteEvents = new EventEmitter();

const enrichProductWithVoteStatus = async (product: any, userId: string | null) => {
  if (!userId) return { ...product, hasVoted: false };

  const vote = await db.vote.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: product.id,
      },
    },
  });

  return {
    ...product,
    hasVoted: !!vote,
  };
};

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

      const nowUTC = getUTCDate(new Date());
      const productLaunchUTC = getUTCDate(new Date(product.launchDate));
      
      if (productLaunchUTC < nowUTC) {
        throw new Error('Launch date has passed (UTC)');
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

  // Get products for today's launches
  getUpcoming: publicProcedure.query(async ({ ctx }) => {
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

    // Get all products for today
    const products = await db.product.findMany({
      where: {
        launchDate: {
          gte: todayStartUTC,
          lte: todayEndUTC
        },
        isLaunched: true
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
            avatarUrl: true,
            username: true,
            twitter: true
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

    // If user is authenticated, enrich with vote status
    const enrichedProducts = ctx.userId
      ? await Promise.all(products.map(product => 
          enrichProductWithVoteStatus(product, ctx.userId)
        ))
      : products;

    // After 21:00 UTC, determine winners with ties
    const isVotingClosed = now.getUTCHours() >= 21;
    
    if (isVotingClosed && products.length > 0) {
      // Sort by votes first, then by launch time for ties
      return enrichedProducts.sort((a, b) => {
        const voteDiff = (b._count?.votes || 0) - (a._count?.votes || 0);
        if (voteDiff === 0) {
          // If votes are tied, sort by launch time
          return new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime();
        }
        return voteDiff;
      });
    }

    // Before 21:00 UTC, sort by launch time
    return enrichedProducts.sort((a, b) => 
      new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime()
    );
  }),

  // Get yesterday's winners
  getYesterdayWinners: publicProcedure.query(async () => {
    const now = new Date();
    const yesterdayStartUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - 1,
      0, 0, 0
    ));
    const yesterdayEndUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - 1,
      23, 59, 59, 999
    ));

    const products = await db.product.findMany({
      where: {
        launchDate: {
          gte: yesterdayStartUTC,
          lte: yesterdayEndUTC
        },
        isLaunched: true
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
            avatarUrl: true,
            username: true,
            twitter: true
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

    // Add logic to detect ties
    const enrichedProducts = products.map((product, index, array) => {
      const currentVotes = product._count?.votes || 0;
      const prevProduct = index > 0 ? array[index - 1] : null;
      const prevVotes = prevProduct ? prevProduct._count?.votes || 0 : null;
      
      const isTied = prevProduct && currentVotes === prevVotes;
      const rank = isTied ? array.findIndex(p => (p._count?.votes || 0) === currentVotes) + 1 : index + 1;

      return {
        ...product,
        rank,
        isTied
      };
    });

    return enrichedProducts;
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
            username: true,
            twitter: true
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

  // get todays winner 

  getTodaysWinners: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    // First, get all launched products for today with their vote counts
    const products = await db.product.findMany({
      where: {
        launchDate: {
          gte: todayStart,
          lte: todayEnd
        },
        isLaunched: true,
        // launchStarted: true
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
            username: true,
            avatarUrl: true,
            twitter: true
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
        votes: { _count: 'desc' }
      }
    });

    // If we have products, determine winners (products with same top vote count)
    if (products.length > 0) {
      const topVoteCount = products[0]._count?.votes || 0;
      const winners = products.filter(p => (p._count?.votes || 0) === topVoteCount);

      // If we have less than 3 winners with the top vote count,
      // get the next tier of winners
      if (winners.length < 3) {
        const remainingSlots = 3 - winners.length;
        const nextTierProducts = products
          .filter(p => (p._count?.votes || 0) < topVoteCount)
          .reduce((acc, product) => {
            const voteCount = product._count?.votes || 0;
            if (acc.length === 0 || (acc[0]._count?.votes || 0) === voteCount) {
              acc.push(product);
            }
            return acc;
          }, [] as typeof products)
          .slice(0, remainingSlots);

        winners.push(...nextTierProducts);
      }

      return winners;
    }

    return [];
  }),

  // ... rest of the code ...

  // get today's winners (already launched products)
  /*
  getTodaysWinners: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const winners = await db.product.findMany({
      where: {
        launchDate: {
          gte: todayStart,
          lte: now // Only get products that should have launched by now
        },
        isLaunched: true,
        launchStarted: true, // New field to track actual launch
      },
      orderBy: {
        votes: {
          _count: 'desc'
        }
      },
      take: 3,
      include: {
        categories: {
          include: {
            category: true
          }
        },
        maker: {
          select: {
            name: true,
            username: true,
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
  */
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
        .transform((str) => getUTCDate(new Date(str)))
        .refine((date) => {
          const nowUTC = getUTCDate(new Date());
          const maxDateUTC = getUTCDate(addDays(nowUTC, 14));
          return date > nowUTC && date <= maxDateUTC;
        }, {
          message: "Launch date must be between tomorrow and 14 days from now (UTC)"
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
              twitter: true
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
    .input(z.object({
      productId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const currentUTCHour = now.getUTCHours();

      // Check if voting is still allowed (before 21:00 UTC)
      if (currentUTCHour >= 21) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Voting has ended for today'
        });
      }

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
      launchDate: z.string()
        .transform((str) => getUTCDate(new Date(str)))
        .refine((date) => {
          const nowUTC = getUTCDate(new Date());
          const maxDateUTC = getUTCDate(addDays(nowUTC, 14));
          return date > nowUTC && date <= maxDateUTC;
        }, {
          message: "Launch date must be between tomorrow and 14 days from now (UTC)"
        }),
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

      // Delete all related records in a transaction
      return db.$transaction(async (tx) => {
        // Delete categories associations
        await tx.categoriesOnProducts.deleteMany({
          where: { productId: input.productId }
        });

        // Delete votes
        await tx.vote.deleteMany({
          where: { productId: input.productId }
        });

        // Delete comments
        await tx.comment.deleteMany({
          where: { productId: input.productId }
        });

        // Delete product images
        await tx.productImage.deleteMany({
          where: { productId: input.productId }
        });

        // Finally delete the product
        return tx.product.delete({
          where: { id: input.productId }
        });
      });
    }),

  // Get past launches (paginated)
  getPastLaunches: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const now = new Date();
      const twoDaysAgoUTC = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - 2,
        0, 0, 0
      ));

      const items = await db.product.findMany({
        take: input.limit + 1,
        where: {
          launchDate: {
            lt: twoDaysAgoUTC
          },
          isLaunched: true
        },
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
              avatarUrl: true,
              username: true,
              twitter: true
            }
          },
          _count: {
            select: {
              votes: true,
              comments: true
            }
          }
        },
        orderBy: [
          { launchDate: 'desc' },
          { votes: { _count: 'desc' }}
        ]
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

  // Get next launch for countdown
  getNextLaunch: publicProcedure.query(async () => {
    const nowUTC = getUTCDate(new Date());
    const maxDateUTC = getUTCDate(addDays(nowUTC, 14));
    const currentUTCHour = nowUTC.getUTCHours();
    
    // If before 21:00 UTC, get next launch today
    if (currentUTCHour < 21) {
      const todayStartUTC = new Date(Date.UTC(
        nowUTC.getUTCFullYear(),
        nowUTC.getUTCMonth(),
        nowUTC.getUTCDate(),
        0, 0, 0
      ));
      const todayEndUTC = new Date(Date.UTC(
        nowUTC.getUTCFullYear(),
        nowUTC.getUTCMonth(),
        nowUTC.getUTCDate(),
        23, 59, 59, 999
      ));

      const nextLaunch = await db.product.findFirst({
        where: {
          launchDate: {
            gte: nowUTC,
            lte: todayEndUTC
          },
          isLaunched: true
        },
        orderBy: {
          launchDate: 'asc'
        },
        select: {
          name: true,
          launchDate: true
        }
      });

      if (nextLaunch) {
        return {
          ...nextLaunch,
          isVotingEnd: false
        };
      }
    }

    // Get next day's first launch within the 14-day limit
    const nextDayLaunch = await db.product.findFirst({
      where: {
        launchDate: {
          gt: nowUTC,
          lte: maxDateUTC
        },
        isLaunched: true
      },
      orderBy: {
        launchDate: 'asc'
      },
      select: {
        name: true,
        launchDate: true
      }
    });

    if (nextDayLaunch) {
      return {
        ...nextDayLaunch,
        isVotingEnd: true
      };
    }

    return null;
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

  // Add new cancelLaunch mutation
  cancelLaunch: privateProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const product = await db.product.findUnique({
        where: { id: input.productId }
      });

      if (!product) throw new Error('Product not found');
      if (!product.isLaunched) throw new Error('Product is not launched');
      
      const nowUTC = getUTCDate(new Date());
      const productLaunchUTC = getUTCDate(new Date(product.launchDate));
      
      // Check if launch date has passed
      if (productLaunchUTC < nowUTC) {
        throw new Error('Cannot cancel launch after launch date has passed (UTC)');
      }

      return db.product.update({
        where: { id: input.productId },
        data: { isLaunched: false },
        select: {
          id: true,
          slug: true,
          isLaunched: true
        }
      });
    }),

  // Example for getProduct procedure
  getProduct: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await db.product.findUnique({
        where: { slug: input.slug },
        include: {
          maker: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              twitter: true,
            }
          },
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          },
          images: true,
          _count: {
            select: {
              votes: true,
              comments: true,
            }
          }
        }
      });

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      // Check if the current user has voted for this product
      let hasVoted = false;
      if (ctx.userId) {
        const vote = await db.vote.findUnique({
          where: {
            userId_productId: {
              userId: ctx.userId,
              productId: product.id,
            }
          }
        });
        hasVoted = !!vote;
      }

      return {
        ...product,
        hasVoted,
      };
    }),
}); 