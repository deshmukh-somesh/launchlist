import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';

// Create context type
type Context = {
  userId: string | null;
}

const t = initTRPC.context<Context>().create();
const middleware = t.middleware;

const isAuth = middleware(async (opts) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return opts.next({
    ctx: {
      userId: user.id,
      user,
    }
  });
});

// Create context for each request
export const createContext = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return {
    userId: user?.id || null,
  };
};

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);