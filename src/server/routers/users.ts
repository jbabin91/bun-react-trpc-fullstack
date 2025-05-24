import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { db } from '@/db';
import {
  insertUserSchema,
  type NewUser,
  type User,
  users,
} from '@/db/schema/users';

import { publicProcedure, router } from '../trpc';

// User repository operations
export class UserRepository {
  static async findAll(): Promise<User[]> {
    return await db.select().from(users);
  }

  static async findById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  static async findByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  static async create(userData: NewUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  static async update(
    id: string,
    userData: Partial<NewUser>,
  ): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  static async delete(id: string): Promise<void> {
    // Note: Posts will be automatically deleted due to CASCADE DELETE constraint
    await db.delete(users).where(eq(users.id, id));
  }

  static async getUserWithPosts(id: string) {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        posts: {
          orderBy: (posts, { desc }) => desc(posts.createdAt),
        },
      },
    });
  }
}

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
