import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/trpc';
import { NextRequest } from 'next/server';
import { createContext } from '@/trpc/trpc';

async function handler(req: NextRequest) {
  return await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => await createContext(),
  });
}

export { handler as GET, handler as POST };