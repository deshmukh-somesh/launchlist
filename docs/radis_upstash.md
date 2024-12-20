schema.prisma

// ... existing schema ...

model Product {
  // ... existing fields ...

  @@index([name])
  @@index([createdAt])
  @@index([launchDate])
}

model User {
  // ... existing fields ...

  @@index([username])
  @@index([name])
}

model Collection {
  // ... existing fields ...

  @@index([name])
  @@index([isPublic])
}


 ### lib/radis.ts
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
})

export const CACHE_KEYS = {
  TRENDING_PRODUCTS: 'trending-products',
  FEATURED_COLLECTIONS: 'featured-collections',
} as const


#### treding.ts 
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { redis, CACHE_KEYS } from '../../lib/redis';
import { TRPCError } from '@trpc/server';

export const trendingRouter = router({
  getTrendingProducts: publicProcedure
    .input(z.object({
      timeframe: z.enum(['DAY', 'WEEK', 'MONTH']).default('WEEK'),
      cursor: z.number().default(0),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const cacheKey = `${CACHE_KEYS.TRENDING_PRODUCTS}:${input.timeframe}:${input.cursor}:${input.limit}`;
      
      // Try to get from cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const timeframeDate = new Date();
      switch (input.timeframe) {
        case 'DAY':
          timeframeDate.setDate(timeframeDate.getDate() - 1);
          break;
        case 'WEEK':
          timeframeDate.setDate(timeframeDate.getDate() - 7);
          break;
        case 'MONTH':
          timeframeDate.setMonth(timeframeDate.getMonth() - 1);
          break;
      }

      const products = await ctx.db.product.findMany({
        where: {
          createdAt: {
            gte: timeframeDate,
          },
        },
        include: {
          maker: true,
          _count: {
            select: { votes: true },
          },
        },
        orderBy: {
          votes: {
            _count: 'desc',
          },
        },
        take: input.limit + 1, // Get one extra to check if there are more
        skip: input.cursor,
      });

      const hasMore = products.length > input.limit;
      const items = hasMore ? products.slice(0, -1) : products;

      const result = {
        items,
        nextCursor: hasMore ? input.cursor + input.limit : undefined,
      };

      // Cache the results for 5 minutes
      await redis.set(cacheKey, JSON.stringify(result), {
        ex: 300, // 5 minutes
      });

      return result;
    }),
});


### rateLimit.ts

import { redis } from '../lib/redis';
import { TRPCError } from '@trpc/server';
import { middleware } from '../trpc';

export const rateLimit = middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const ip = ctx.req?.headers['x-forwarded-for'] || 'unknown';
  const key = `rate-limit:${ctx.userId}:${ip}`;

  const requests = await redis.incr(key);
  
  if (requests === 1) {
    await redis.expire(key, 60); // Reset after 60 seconds
  }

  if (requests > 100) { // 100 requests per minute
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded',
    });
  }

  return next();
});


 ### search.ts 

import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { rateLimit } from '../middleware/rateLimit';

export const searchRouter = router({
  search: publicProcedure
    .use(rateLimit)
    .input(z.object({
      query: z.string(),
      type: z.enum(['PRODUCTS', 'USERS', 'COLLECTIONS']).default('PRODUCTS'),
      cursor: z.number().default(0),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      // ... existing search logic ...
    }),
});


.env 

# ... existing env vars ...

# Redis configuration
REDIS_URL="your-redis-url"
REDIS_TOKEN="your-redis-token"



### install required dependencies: 

npm install @upstash/redis







error-formatter.ts

import { TRPCError } from '@trpc/server';

export const errorFormatter = (error: TRPCError) => {
  const formattedError = {
    code: error.code,
    message: error.message,
    data: {
      ...error.cause,
    },
  };

  // Custom handling for rate limiting
  if (error.code === 'TOO_MANY_REQUESTS') {
    return {
      ...formattedError,
      message: 'You have exceeded the rate limit. Please try again later.',
    };
  }

  return formattedError;
};