import { z } from 'zod/v4';

import { insertUserSchema } from '@/db/schema/users';
import { publicProcedure, router } from '@/server/trpc';

import { UserRepository } from './repository';

// Users router
export const usersRouter = router({
  create: publicProcedure
    .input(
      insertUserSchema.omit({ createdAt: true, id: true, updatedAt: true }),
    )
    .mutation(async ({ input }) => {
      return await UserRepository.create(input);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await UserRepository.delete(input.id);
      return { success: true };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await UserRepository.findById(input.id);
    }),

  getUserWithPosts: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await UserRepository.getUserWithPosts(input.id);
    }),

  list: publicProcedure.query(async () => {
    return await UserRepository.findAll();
  }),

  update: publicProcedure
    .input(
      z.object({
        data: insertUserSchema
          .omit({ createdAt: true, id: true, updatedAt: true })
          .partial(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await UserRepository.update(input.id, input.data);
    }),
});
