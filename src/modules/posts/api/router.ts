import { insertPostSchema } from '@/db/schema/posts';
import { publicProcedure, router } from '@/server/trpc';

import {
  deletePostSchema,
  getPostByIdSchema,
  getPostsByAuthorSchema,
  updatePostSchema,
} from '../schemas';
import { PostRepository } from './repository';

// Posts tRPC router
export const postsRouter = router({
  create: publicProcedure
    .input(
      insertPostSchema.omit({ createdAt: true, id: true, updatedAt: true }),
    )
    .mutation(async ({ input }) => {
      return await PostRepository.create(input);
    }),

  delete: publicProcedure
    .input(deletePostSchema)
    .mutation(async ({ input }) => {
      await PostRepository.delete(input.id);
      return { success: true };
    }),

  getByAuthor: publicProcedure
    .input(getPostsByAuthorSchema)
    .query(async ({ input }) => {
      return await PostRepository.findByAuthor(input.authorId);
    }),

  getById: publicProcedure.input(getPostByIdSchema).query(async ({ input }) => {
    return await PostRepository.findById(input.id);
  }),

  getCount: publicProcedure.query(async () => {
    const count = await PostRepository.getPostCount();
    return { count };
  }),

  getPostsWithAuthors: publicProcedure.query(async () => {
    return await PostRepository.getPostsWithAuthors();
  }),

  list: publicProcedure.query(async () => {
    return await PostRepository.findAll();
  }),

  update: publicProcedure
    .input(updatePostSchema)
    .mutation(async ({ input }) => {
      return await PostRepository.update(input.id, input.data);
    }),
});
