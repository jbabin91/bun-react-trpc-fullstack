import { publicProcedure, router } from '@/server/trpc';

import { helloInputSchema, updateHelloInputSchema } from '../schemas';
import type { HelloResponse } from '../types';

export const helloRouter = router({
  hello: publicProcedure
    .input(helloInputSchema)
    .query(({ input }): HelloResponse => {
      const message = input.name ? `Hello, ${input.name}!` : 'Hello, world!';

      return {
        message,
        method: input.method,
      };
    }),

  updateHello: publicProcedure
    .input(updateHelloInputSchema)
    .mutation(({ input }): HelloResponse => {
      const message = input.name
        ? `Hello, ${input.name}! (Updated)`
        : 'Hello, world! (Updated)';

      return {
        message,
        method: 'PUT',
      };
    }),
});
