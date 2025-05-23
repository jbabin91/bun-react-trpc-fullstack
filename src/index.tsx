import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { serve } from 'bun';

import index from '@/index.html';
import { appRouter } from '@/server/router';

const server = serve({
  development: process.env.NODE_ENV !== 'production' && {
    // Echo console logs from the browser to the server
    console: true,
    // Enable browser hot reloading in development
    hmr: true,
  },

  routes: {
    // Serve index.html for all unmatched routes.
    '/*': index,
    // tRPC handler
    '/api/trpc/*': (req) => {
      return fetchRequestHandler({
        createContext: () => ({}),
        endpoint: '/api/trpc',
        req,
        router: appRouter,
      });
    },
  },
});

console.log(`🚀 Server running at ${server.url}`);
