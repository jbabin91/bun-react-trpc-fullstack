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
    // Keep existing REST endpoints for comparison
    '/api/hello': {
      GET() {
        return Response.json({
          message: 'Hello, world!',
          method: 'GET',
        });
      },
      PUT() {
        return Response.json({
          message: 'Hello, world!',
          method: 'PUT',
        });
      },
    },
    '/api/hello/:name': (req) => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
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
