import { z } from 'zod';
import { router, publicProcedure, privateProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { db } from '../../db';

const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().optional(),
});

const updateCategorySchema = createCategorySchema.partial();



export const categoryRouter = router({

  getAllCategories: publicProcedure
    .query(async () => {
      console.log('Fetching all categories...');
      const categories = await db.category.findMany({
        include: {
          subcategories: {
            include: {
              _count: {
                select: { products: true }
              }
            }
          },
          parent: true,
          _count: {
            select: { products: true }
          }
        },
        orderBy: { order: 'asc' }
      });
      
      console.log('Categories fetched:', categories.length);
      return categories;
    }),
    
  getRootCategories: publicProcedure
    .query(async () => {
      console.log('Fetching root categories...');
      const rootCategories = await db.category.findMany({
        where: { parentId: null },
        include: {
          subcategories: {
            include: {
              _count: {
                select: { products: true }
              }
            }
          },
          _count: {
            select: { products: true }
          }
        },
        orderBy: { order: 'asc' }
      });
      
      console.log('Root categories fetched:', rootCategories.length);
      return rootCategories;
    }),

  getById: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const category = await db.category.findUnique({
        where: { id: input },
        include: {
          subcategories: true,
          parent: true,
          products: {
            include: {
              product: {
                include: {
                  maker: true,
                  _count: {
                    select: { votes: true }
                  }
                }
              }
            }
          }
        }
      });

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      return category;
    }),

  create: privateProcedure
    .input(createCategorySchema)
    .mutation(async ({ input }) => {
      if (input.parentId) {
        const parent = await db.category.findUnique({
          where: { id: input.parentId }
        });
        
        if (!parent) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Parent category not found',
          });
        }
      }

      return db.category.create({
        data: input,
        include: { parent: true }
      });
    }),

  update: privateProcedure
    .input(z.object({
      id: z.string(),
      data: updateCategorySchema
    }))
    .mutation(async ({ input }) => {
      const { id, data } = input;

      const exists = await db.category.findUnique({
        where: { id }
      });

      if (!exists) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      if (data.parentId === id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Category cannot be its own parent',
        });
      }

      return db.category.update({
        where: { id },
        data,
        include: { parent: true }
      });
    }),

  delete: privateProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const hasSubcategories = await db.category.findFirst({
        where: { parentId: input }
      });

      if (hasSubcategories) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete category with subcategories',
        });
      }

      return db.category.delete({
        where: { id: input }
      });
    }),

  reorder: privateProcedure
    .input(z.array(z.object({
      id: z.string(),
      order: z.number()
    })))
    .mutation(async ({ input }) => {
      const updates = input.map(({ id, order }) =>
        db.category.update({
          where: { id },
          data: { order }
        })
      );

      return db.$transaction(updates);
    }),
});