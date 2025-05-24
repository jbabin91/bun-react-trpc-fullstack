import { count, desc, eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { db } from '@/db';
import {
  insertPostSchema,
  type NewPost,
  type Post,
  posts,
} from '@/db/schema/posts';

import { publicProcedure, router } from '../trpc';

// Post repository operations
export class PostRepository {
  static async findAll(): Promise<Post[]> {
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  static async findById(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id));
    return result[0];
  }

  static async findByAuthor(authorId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, authorId))
      .orderBy(desc(posts.createdAt));
  }

  static async create(postData: NewPost): Promise<Post> {
    const result = await db.insert(posts).values(postData).returning();
    return result[0];
  }

  static async update(
    id: string,
    postData: Partial<NewPost>,
  ): Promise<Post | undefined> {
    const result = await db
      .update(posts)
      .set({ ...postData, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return result[0];
  }

  static async delete(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  static async getPostWithAuthor(id: string) {
    return await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        author: true,
      },
    });
  }

  static async getPostsWithAuthors() {
    return await db.query.posts.findMany({
      orderBy: desc(posts.createdAt),
      with: {
        author: true,
      },
    });
  }

  static async getPostCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(posts);
    return result[0].count;
  }
}

// Posts router
export const postsRouter = router({
  create: publicProcedure
    .input(
      insertPostSchema.omit({ createdAt: true, id: true, updatedAt: true }),
    )
    .mutation(async ({ input }) => {
      return await PostRepository.create(input);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await PostRepository.delete(input.id);
      return { success: true };
    }),

  getByAuthor: publicProcedure
    .input(z.object({ authorId: z.string() }))
    .query(async ({ input }) => {
      return await PostRepository.findByAuthor(input.authorId);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
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
    .input(
      z.object({
        data: insertPostSchema
          .omit({ createdAt: true, id: true, updatedAt: true })
          .partial(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await PostRepository.update(input.id, input.data);
    }),
});
