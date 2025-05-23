import { serve } from 'bun';

import index from '@/index.html';

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
  },
});

console.log(`🚀 Server running at ${server.url}`);
