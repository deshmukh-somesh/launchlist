import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/trpc';
import { NextRequest } from 'next/server';

async function handler(req: NextRequest) {
  return await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  });
}

export { handler as GET, handler as POST };