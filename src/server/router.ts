import { z } from 'zod/v4';

import { postsRouter, usersRouter } from './routers';
import { publicProcedure, router } from './trpc';

export const appRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        method: z.enum(['GET', 'PUT']).optional().default('GET'),
        name: z.string().optional(),
      }),
    )
    .query(({ input }) => {
      const message = input.name ? `Hello, ${input.name}!` : 'Hello, world!';

      return {
        message,
        method: input.method,
      };
    }),
  posts: postsRouter,
  updateHello: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const message = input.name
        ? `Hello, ${input.name}! (Updated)`
        : 'Hello, world! (Updated)';

      return {
        message,
        method: 'PUT',
      };
    }),
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
