import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { Prisma } from '@prisma/client';
import { generateUsername } from "@/components/generateUsername";
import { userRouter } from './routers/user';
import { productRouter } from './routers/product';
import { collectionRouter } from './routers/collection';
import { commentRouter } from './routers/comment';
import { categoryRouter } from './routers/category';
import { notificationRouter } from './routers/notification';
import { searchRouter } from './routers/search';
import { trendingRouter } from './routers/trending';

export const appRouter = router({
  user: userRouter,
  product: productRouter,
  collection: collectionRouter,
  comment: commentRouter,
  category: categoryRouter,
  notification: notificationRouter,
  search: searchRouter,
  trending: trendingRouter,
  // auth call back -> api endpoint
  authCallback: publicProcedure.query(async () => {
    // i am getting the user:(this user refers to the logged in user. )
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
      // Create new user
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
          username: generateUsername(user.email),
          avatarUrl: user.picture || null,
        },
      });
    } else if (dbUser.id !== user.id) {
      // Update existing user with new ID
      await db.user.update({
        where: { email: user.email },
        data: { id: user.id }

      });
    }

    return { success: true };
  }),



});



export type AppRouter = typeof appRouter;
