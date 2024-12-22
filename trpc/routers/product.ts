import { db } from '@/db';
import { router, privateProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { isPast } from 'date-fns';
import { TRPCError } from '@trpc/server';

export const productRouter = router({

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
       data: { isLaunched: true }
     });
   }),

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
                votes: true
              }
            }
          }
        });
       }),
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
                votes: true
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
    //    getTodaysWinners: publicProcedure.query(async ({ ctx }) => {
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);
        
    //     const tomorrow = new Date(today);
    //     tomorrow.setDate(tomorrow.getDate() + 1);
    //      return db.product.findMany({
    //       where: {
    //         launchDate: {
    //           gte: today,
    //           lt: tomorrow
    //         }
    //       },
    //       select: {
    //         id: true,
    //         slug: true,
    //         name: true,
    //         tagline: true,
    //         thumbnail: true,
    //         createdAt: true,
    //         launchDate: true,
    //         categories: {
    //           include: {
    //             category: {
    //               select: {
    //                 id: true,
    //                 name: true,
    //               }
    //             }
    //           }
    //         },
    //         maker: {
    //           select: {
    //             name: true,
    //             avatarUrl: true,
    //           }
    //         },
    //         _count: {
    //           select: {
    //             votes: true
    //           }
    //         }
    //       },
    //       orderBy: {
    //         votes: {
    //           _count: 'desc'
    //         }
    //       },
    //       take: 3
    //     });
    //   }),

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
                votes: true
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

  // Get product details
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
}); 